import sys
import json
import boto3
from datetime import datetime
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import DataFrame
from pyspark.sql.functions import *

# Initialize Glue context
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)

# Get job arguments
args = getResolvedOptions(sys.argv, [
    'JOB_NAME',
    'source_bucket',
    'output_bucket', 
    'metadata_table',
    'source_key',
    'file_id'
])

job.init(args['JOB_NAME'], args)

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(args['metadata_table'])

def update_metadata(file_id: str, status: str, **kwargs):
    """Update metadata in DynamoDB"""
    try:
        update_expr = "SET processing_status = :status, updated_at = :updated_at"
        expr_values = {
            ':status': status,
            ':updated_at': datetime.utcnow().isoformat()
        }
        
        for key, value in kwargs.items():
            update_expr += f", {key} = :{key}"
            expr_values[f":{key}"] = value
            
        table.update_item(
            Key={'file_id': file_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values
        )
    except Exception as e:
        print(f"Error updating metadata: {str(e)}")

def main():
    file_id = args['file_id']
    source_path = f"s3://{args['source_bucket']}/{args['source_key']}"
    
    try:
        # Update status to processing
        update_metadata(file_id, 'IN_PROGRESS', start_time=datetime.utcnow().isoformat())
        
        # Read parquet file
        print(f"Reading parquet file from: {source_path}")
        df = spark.read.parquet(source_path)
        
        # Get record count
        record_count = df.count()
        print(f"Processing {record_count} records")
        
        # Convert to JSON format
        json_df = df.select(to_json(struct([col(c) for c in df.columns])).alias("json_data"))
        
        # Generate output path
        timestamp = datetime.utcnow().strftime("%Y/%m/%d")
        filename = args['source_key'].split('/')[-1].replace('.parquet', '.json')
        output_path = f"s3://{args['output_bucket']}/processed-data/{timestamp}/{filename}"
        
        # Write JSON output
        print(f"Writing JSON output to: {output_path}")
        json_df.select("json_data").write.mode("overwrite").text(output_path)
        
        # Update metadata with success
        update_metadata(
            file_id, 
            'COMPLETED',
            end_time=datetime.utcnow().isoformat(),
            output_file_path=output_path,
            record_count=record_count
        )
        
        print(f"Successfully processed {record_count} records")
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error processing file: {error_msg}")
        
        # Update metadata with failure
        update_metadata(
            file_id,
            'FAILED', 
            end_time=datetime.utcnow().isoformat(),
            error_message=error_msg
        )
        
        raise e

if __name__ == "__main__":
    main()

job.commit()

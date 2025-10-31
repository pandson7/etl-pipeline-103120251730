# Technical Design Document

## Architecture Overview

The ETL pipeline leverages AWS Glue for data processing, S3 for storage, and DynamoDB for metadata management. The system follows an event-driven architecture where file uploads trigger processing workflows.

## System Components

### 1. AWS Glue Job
- **Purpose**: Core ETL processing engine
- **Runtime**: Python 3.9 with Spark
- **Functionality**: Parquet to JSON transformation
- **Scaling**: Auto-scaling based on data volume

### 2. Amazon S3 Buckets
- **Source Bucket**: Stores incoming parquet files
- **Output Bucket**: Stores transformed JSON files
- **Structure**: Organized by date and processing batch

### 3. DynamoDB Table
- **Table Name**: etl-pipeline-metadata
- **Primary Key**: file_id (String)
- **Attributes**: 
  - source_file_path
  - output_file_path
  - processing_status
  - start_time
  - end_time
  - record_count
  - error_message

### 4. AWS Lambda Function
- **Purpose**: Orchestrate Glue job execution
- **Runtime**: Node.js 18.x
- **Trigger**: S3 event notifications

### 5. CloudWatch
- **Purpose**: Logging and monitoring
- **Metrics**: Job duration, success/failure rates
- **Alarms**: Processing failures and performance issues

## Data Flow Architecture

```
[S3 Source Bucket] → [Lambda Trigger] → [Glue Job] → [S3 Output Bucket]
                                           ↓
                                    [DynamoDB Metadata]
                                           ↓
                                    [CloudWatch Logs]
```

## Technical Specifications

### Glue Job Configuration
- **Job Type**: Spark ETL
- **Glue Version**: 4.0
- **Worker Type**: G.1X
- **Number of Workers**: Auto-scaling (2-10)
- **Timeout**: 60 minutes
- **Max Retries**: 2

### DynamoDB Schema
```json
{
  "file_id": "string",
  "source_file_path": "string",
  "output_file_path": "string", 
  "processing_status": "string",
  "start_time": "string",
  "end_time": "string",
  "record_count": "number",
  "file_size_bytes": "number",
  "error_message": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### S3 Bucket Structure
```
source-bucket/
├── raw-data/
│   └── YYYY/MM/DD/
│       └── yellow_tripdata_YYYY-MM.parquet

output-bucket/
├── processed-data/
│   └── YYYY/MM/DD/
│       └── yellow_tripdata_YYYY-MM.json
```

## Processing Logic

### 1. File Detection
- S3 event notification triggers Lambda function
- Lambda validates file format and size
- Lambda initiates Glue job with file parameters

### 2. Data Transformation
- Glue job reads parquet file using Spark DataFrame
- Schema validation ensures data integrity
- Row-by-row transformation to JSON format
- Data quality checks during transformation

### 3. Metadata Management
- Create metadata record at job start
- Update record with progress information
- Final update with completion status and statistics

### 4. Error Handling
- Comprehensive try-catch blocks in Glue script
- Detailed error logging to CloudWatch
- Metadata updates for failed processing
- Automatic retry mechanism for transient failures

## Security Considerations

### IAM Roles and Policies
- **Glue Service Role**: Access to S3 buckets and DynamoDB
- **Lambda Execution Role**: Trigger Glue jobs and write logs
- **Principle of Least Privilege**: Minimal required permissions

### Data Encryption
- **S3**: Server-side encryption with AWS managed keys
- **DynamoDB**: Encryption at rest enabled
- **Glue**: Encrypted job bookmarks and logs

## Performance Optimization

### Spark Configuration
- Optimized partition size for parquet reading
- Dynamic allocation enabled
- Broadcast joins for small lookup tables

### DynamoDB Optimization
- On-demand billing mode for variable workloads
- Global secondary indexes for query patterns
- Point-in-time recovery enabled

## Monitoring and Alerting

### CloudWatch Metrics
- Job execution duration
- Data processing throughput
- Error rates and types
- Resource utilization

### Alarms
- Job failure notifications
- Processing time exceeding thresholds
- DynamoDB throttling events

## Deployment Strategy

### Infrastructure as Code
- AWS CDK for resource provisioning
- Environment-specific configurations
- Automated deployment pipeline

### Testing Strategy
- Unit tests for transformation logic
- Integration tests with sample data
- End-to-end pipeline validation

## Scalability Considerations

### Horizontal Scaling
- Auto-scaling Glue workers based on data volume
- Parallel processing of multiple files
- DynamoDB auto-scaling for read/write capacity

### Vertical Scaling
- Worker type optimization based on data characteristics
- Memory allocation tuning for large files
- Spark configuration optimization

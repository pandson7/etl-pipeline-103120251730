#!/bin/bash

echo "=== ETL Pipeline Validation ==="

# Check DynamoDB metadata
echo "1. Checking DynamoDB metadata records:"
aws dynamodb scan --table-name "etl-pipeline-metadata-103120251730" --query 'Items[*].{FileId:file_id.S,Status:processing_status.S,Records:record_count.N,OutputPath:output_file_path.S}' --output table

# Check output files
echo -e "\n2. Checking output files in S3:"
aws s3 ls s3://etl-output-bucket-103120251730/processed-data/ --recursive --human-readable

# Validate JSON format
echo -e "\n3. Validating JSON format (first 3 records):"
aws s3 cp s3://etl-output-bucket-103120251730/processed-data/2025/10/31/yellow_tripdata_2021-01.json/part-00001-6a7c24a0-a370-47e4-a9e6-afd22d652442-c000.txt - | head -3 | jq .

echo -e "\n=== Validation Complete ==="

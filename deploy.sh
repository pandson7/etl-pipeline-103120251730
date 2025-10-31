#!/bin/bash

# Get AWS account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

# Create S3 bucket for CDK assets if it doesn't exist
BUCKET_NAME="${ACCOUNT_ID}-cdk-assets-${REGION}"
aws s3 mb s3://${BUCKET_NAME} 2>/dev/null || true

# Upload Glue script to S3
aws s3 cp src/glue_job.py s3://${BUCKET_NAME}/glue_job.py

echo "Glue script uploaded to s3://${BUCKET_NAME}/glue_job.py"

# Deploy CDK stack
npm run deploy

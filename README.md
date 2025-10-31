# ETL Pipeline Project

## Overview

This project implements an ETL (Extract, Transform, Load) pipeline using AWS Glue that processes parquet files, transforms them to JSON format, and stores metadata in DynamoDB.

## Architecture

- **AWS Glue**: Core ETL processing engine for parquet to JSON transformation
- **Amazon S3**: Storage for source parquet files and output JSON files
- **DynamoDB**: Metadata storage for processing status and file information
- **AWS Lambda**: Orchestration and trigger management
- **CloudWatch**: Monitoring, logging, and alerting

## Project Structure

```
etl-pipeline-103120251730/
├── specs/
│   ├── requirements.md    # User stories and acceptance criteria
│   ├── design.md         # Technical architecture and design
│   └── tasks.md          # Implementation plan and tasks
├── src/                  # Source code
├── tests/                # Test files
├── cdk-app/             # AWS CDK infrastructure code
└── generated-diagrams/   # Architecture diagrams
```

## Sample Data

The pipeline processes taxi trip data in parquet format. Sample file:
- `yellow_tripdata_2021-01.parquet` - NYC taxi trip data for January 2021

## Getting Started

1. Review the specifications in the `specs/` folder
2. Follow the implementation plan in `tasks.md`
3. Deploy infrastructure using AWS CDK
4. Test with sample data

## Key Features

- Automatic file detection and processing
- Comprehensive error handling and retry mechanisms
- Metadata tracking for all processing activities
- Scalable architecture with auto-scaling capabilities
- Monitoring and alerting for operational visibility

## Requirements

- AWS Account with appropriate permissions
- AWS CLI configured
- Node.js 18.x or later
- Python 3.9 or later
- AWS CDK installed

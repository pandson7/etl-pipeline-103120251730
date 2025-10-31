# AWS ETL Pipeline - Comprehensive Pricing Analysis

## Executive Summary

This document provides detailed cost estimates for the AWS ETL Pipeline solution that processes parquet files to JSON format using AWS Glue, S3, DynamoDB, Lambda, and CloudWatch. The analysis includes multiple usage scenarios and cost optimization recommendations.

**Key Services:**
- AWS Glue (ETL Processing)
- Amazon S3 (Storage)
- Amazon DynamoDB (Metadata Management)
- AWS Lambda (Orchestration)
- Amazon CloudWatch (Monitoring & Logging)

**Region:** US East (N. Virginia)
**Pricing Model:** On-Demand
**Analysis Date:** October 31, 2025

---

## Service-by-Service Pricing Breakdown

### 1. AWS Glue

**Primary Component:** ETL Job Processing
- **Unit Price:** $0.44 per DPU-Hour
- **Worker Type:** G.1X (4 vCPU, 16 GB memory, 64 GB disk)
- **Auto-scaling:** 2-10 workers based on data volume

**Cost Calculation:**
- Each G.1X worker = 1 DPU
- Processing time varies by data volume and complexity
- Typical job duration: 5-30 minutes depending on file size

### 2. Amazon S3

**Storage Classes Used:**
- **General Purpose (Standard):** Primary storage for source and output files
  - First 50 TB: $0.023 per GB-month
  - Next 450 TB: $0.022 per GB-month
  - Over 500 TB: $0.021 per GB-month

**API Requests:**
- PUT/POST requests: ~$0.0005 per 1,000 requests
- GET requests: ~$0.0004 per 1,000 requests

### 3. Amazon DynamoDB

**On-Demand Pricing:**
- **Read Request Units:** $0.125 per million RRUs
- **Write Request Units:** $1.25 per million WRUs (estimated from pricing data)
- **Storage:** $0.25 per GB-month

**Table Schema:** Metadata tracking with 10 attributes per record

### 4. AWS Lambda

**Compute Pricing:**
- **Requests:** $0.20 per million requests
- **Duration:** $0.0000133334 per GB-second (first 7.5B GB-seconds)
- **Memory:** 512 MB recommended for orchestration tasks

**Free Tier:** 1M requests and 400,000 GB-seconds per month

### 5. Amazon CloudWatch

**Logs Pricing:**
- **Custom Log Ingestion:** $0.50 per GB
- **Log Storage:** $0.03 per GB-month
- **Data Protection Scanning:** $0.12 per GB (if enabled)

**Metrics:** First 10 metrics free, then $0.30 per metric per month

---

## Usage Scenarios & Cost Estimates

### Scenario 1: Low Usage (Development/Testing)
**Monthly Processing Volume:**
- 100 files per month
- Average file size: 50 MB parquet → 75 MB JSON
- Total data processed: 5 GB input, 7.5 GB output

**Cost Breakdown:**
- **AWS Glue:** 10 DPU-hours × $0.44 = $4.40
- **S3 Storage:** 12.5 GB × $0.023 = $0.29
- **S3 Requests:** 200 requests × $0.0005 = $0.10
- **DynamoDB:** 100 writes + 300 reads = $0.16
- **Lambda:** 100 requests × 2s × 0.5GB = $0.01
- **CloudWatch:** 0.5 GB logs × $0.50 = $0.25

**Total Monthly Cost: ~$5.21**

### Scenario 2: Medium Usage (Production)
**Monthly Processing Volume:**
- 1,000 files per month
- Average file size: 200 MB parquet → 300 MB JSON
- Total data processed: 200 GB input, 300 GB output

**Cost Breakdown:**
- **AWS Glue:** 100 DPU-hours × $0.44 = $44.00
- **S3 Storage:** 500 GB × $0.023 = $11.50
- **S3 Requests:** 2,000 requests × $0.0005 = $1.00
- **DynamoDB:** 1,000 writes + 3,000 reads = $1.63
- **Lambda:** 1,000 requests × 3s × 0.5GB = $0.10
- **CloudWatch:** 5 GB logs × $0.50 = $2.50

**Total Monthly Cost: ~$60.73**

### Scenario 3: High Usage (Enterprise)
**Monthly Processing Volume:**
- 10,000 files per month
- Average file size: 500 MB parquet → 750 MB JSON
- Total data processed: 5 TB input, 7.5 TB output

**Cost Breakdown:**
- **AWS Glue:** 1,000 DPU-hours × $0.44 = $440.00
- **S3 Storage:** 12.5 TB × $0.023 = $287.50
- **S3 Requests:** 20,000 requests × $0.0005 = $10.00
- **DynamoDB:** 10,000 writes + 30,000 reads = $16.25
- **Lambda:** 10,000 requests × 5s × 0.5GB = $1.00
- **CloudWatch:** 50 GB logs × $0.50 = $25.00

**Total Monthly Cost: ~$779.75**

---

## Cost Optimization Recommendations

### 1. AWS Glue Optimization
- **Use Glue Flex:** Consider Glue Flex for predictable workloads (20% cost savings)
- **Right-size Workers:** Monitor job metrics to optimize worker count
- **Job Bookmarks:** Enable to avoid reprocessing data
- **Partition Optimization:** Optimize data partitioning for faster processing

### 2. S3 Cost Optimization
- **Lifecycle Policies:** Move older files to IA or Glacier storage classes
- **Intelligent Tiering:** Automatically optimize storage costs
- **Compression:** Use efficient compression for parquet files
- **Request Optimization:** Batch operations to reduce API calls

### 3. DynamoDB Optimization
- **On-Demand vs Provisioned:** Evaluate based on traffic patterns
- **Global Secondary Indexes:** Only create necessary indexes
- **Item Size:** Optimize item structure to reduce storage costs
- **TTL:** Implement TTL for temporary metadata

### 4. Lambda Optimization
- **Memory Allocation:** Right-size memory based on actual usage
- **Provisioned Concurrency:** Only for latency-critical functions
- **ARM Architecture:** Consider ARM-based functions for cost savings

### 5. CloudWatch Optimization
- **Log Retention:** Set appropriate retention periods
- **Log Filtering:** Filter logs before ingestion
- **Metric Optimization:** Only create necessary custom metrics
- **Log Compression:** Enable log compression

---

## Free Tier Benefits

### First 12 Months (New AWS Accounts)
- **Lambda:** 1M requests + 400,000 GB-seconds monthly
- **DynamoDB:** 25 GB storage + 25 RCU + 25 WCU
- **CloudWatch:** 10 metrics + 5 GB logs + 1M API requests
- **S3:** 5 GB Standard storage + 20,000 GET + 2,000 PUT requests

### Always Free
- **Lambda:** 1M requests + 400,000 GB-seconds monthly
- **DynamoDB:** 25 GB storage + 25 RCU + 25 WCU monthly
- **CloudWatch:** 10 metrics + 5 GB logs monthly

---

## Cost Monitoring & Alerts

### Recommended CloudWatch Alarms
1. **Glue Job Duration:** Alert if jobs exceed expected runtime
2. **S3 Storage Growth:** Monitor unexpected storage increases
3. **DynamoDB Throttling:** Alert on read/write throttling
4. **Lambda Errors:** Monitor function error rates
5. **Monthly Spend:** Set billing alerts for cost thresholds

### Cost Allocation Tags
- **Environment:** dev, staging, prod
- **Project:** etl-pipeline
- **Owner:** data-engineering-team
- **CostCenter:** relevant business unit

---

## Scaling Considerations

### Horizontal Scaling
- **Glue Auto-scaling:** Automatically adjusts workers (2-10 range)
- **Parallel Processing:** Process multiple files simultaneously
- **DynamoDB Auto-scaling:** Adjusts capacity based on demand

### Performance vs Cost Trade-offs
- **Glue Worker Types:** G.1X (cost-effective) vs G.2X (performance)
- **S3 Transfer Acceleration:** Additional cost for faster uploads
- **DynamoDB Consistency:** Eventually consistent reads cost less

---

## Regional Pricing Variations

**US East (N. Virginia) - Current Region:** Baseline pricing
**Alternative Regions:**
- **US West (Oregon):** ~5-10% higher for most services
- **EU (Ireland):** ~10-15% higher for most services
- **Asia Pacific:** ~15-25% higher for most services

---

## Assumptions & Exclusions

### Assumptions
- Standard ON DEMAND pricing model
- US East (N. Virginia) region
- No Reserved Instance or Savings Plans discounts
- Average file processing complexity
- Standard data retention periods
- No cross-region data transfer

### Exclusions
- Data transfer costs between regions
- Custom VPC networking costs
- AWS Support plan costs
- Third-party tool integration costs
- Development and maintenance costs
- Disaster recovery and backup costs

---

## Summary

The ETL Pipeline solution provides a scalable, serverless architecture for data processing with predictable costs that scale with usage. The total monthly costs range from $5.21 for low usage to $779.75 for high enterprise usage.

**Key Cost Drivers:**
1. AWS Glue processing time (largest component)
2. S3 storage for large datasets
3. CloudWatch logging for high-volume processing

**Optimization Potential:**
- 20-30% savings through Glue Flex and right-sizing
- 15-25% savings through S3 lifecycle policies
- 10-15% savings through efficient logging practices

**Next Steps:**
1. Implement cost monitoring and alerts
2. Set up proper resource tagging
3. Regularly review and optimize resource usage
4. Consider Reserved Instances for predictable workloads

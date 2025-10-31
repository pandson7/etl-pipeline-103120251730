import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

export class EtlPipelineStack103120251730 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const suffix = '103120251730';

    // S3 Buckets
    const sourceBucket = new s3.Bucket(this, `SourceBucket${suffix}`, {
      bucketName: `etl-source-bucket-${suffix}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const outputBucket = new s3.Bucket(this, `OutputBucket${suffix}`, {
      bucketName: `etl-output-bucket-${suffix}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // DynamoDB Table
    const metadataTable = new dynamodb.Table(this, `MetadataTable${suffix}`, {
      tableName: `etl-pipeline-metadata-${suffix}`,
      partitionKey: { name: 'file_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    metadataTable.addGlobalSecondaryIndex({
      indexName: 'status-index',
      partitionKey: { name: 'processing_status', type: dynamodb.AttributeType.STRING },
      readCapacity: 5,
      writeCapacity: 5,
    });

    // IAM Role for Glue Job
    const glueRole = new iam.Role(this, `GlueRole${suffix}`, {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
      ],
    });

    glueRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
        's3:ListBucket',
      ],
      resources: [
        sourceBucket.bucketArn,
        `${sourceBucket.bucketArn}/*`,
        outputBucket.bucketArn,
        `${outputBucket.bucketArn}/*`,
        `arn:aws:s3:::${cdk.Aws.ACCOUNT_ID}-cdk-assets-${cdk.Aws.REGION}`,
        `arn:aws:s3:::${cdk.Aws.ACCOUNT_ID}-cdk-assets-${cdk.Aws.REGION}/*`,
      ],
    }));

    glueRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:GetItem',
        'dynamodb:Query',
        'dynamodb:Scan',
      ],
      resources: [metadataTable.tableArn],
    }));

    // Glue Job using CfnJob
    const glueJob = new glue.CfnJob(this, `EtlJob${suffix}`, {
      name: `etl-parquet-to-json-${suffix}`,
      role: glueRole.roleArn,
      command: {
        name: 'glueetl',
        scriptLocation: `s3://${cdk.Aws.ACCOUNT_ID}-cdk-assets-${cdk.Aws.REGION}/glue_job.py`,
        pythonVersion: '3',
      },
      defaultArguments: {
        '--source_bucket': sourceBucket.bucketName,
        '--output_bucket': outputBucket.bucketName,
        '--metadata_table': metadataTable.tableName,
        '--enable-metrics': '',
        '--enable-continuous-cloudwatch-log': 'true',
      },
      glueVersion: '4.0',
      workerType: 'G.1X',
      numberOfWorkers: 2,
      timeout: 60,
      maxRetries: 2,
    });

    // Lambda Function
    const orchestratorFunction = new lambda.Function(this, `OrchestratorFunction${suffix}`, {
      functionName: `etl-orchestrator-${suffix}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('./src/lambda'),
      environment: {
        GLUE_JOB_NAME: glueJob.name!,
        METADATA_TABLE: metadataTable.tableName,
      },
      timeout: cdk.Duration.minutes(5),
    });

    orchestratorFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['glue:StartJobRun', 'glue:GetJobRun'],
      resources: [`arn:aws:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:job/${glueJob.name}`],
    }));

    orchestratorFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:GetItem',
      ],
      resources: [metadataTable.tableArn],
    }));

    // S3 Event Notification
    sourceBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(orchestratorFunction),
      { suffix: '.parquet' }
    );

    // Outputs
    new cdk.CfnOutput(this, 'SourceBucketName', {
      value: sourceBucket.bucketName,
      description: 'Source S3 bucket for parquet files',
    });

    new cdk.CfnOutput(this, 'OutputBucketName', {
      value: outputBucket.bucketName,
      description: 'Output S3 bucket for JSON files',
    });

    new cdk.CfnOutput(this, 'MetadataTableName', {
      value: metadataTable.tableName,
      description: 'DynamoDB table for metadata',
    });

    new cdk.CfnOutput(this, 'GlueJobName', {
      value: glueJob.name!,
      description: 'Glue ETL job name',
    });
  }
}

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EtlPipelineStack103120251730 } from './lib/etl-pipeline-stack';

const app = new cdk.App();
new EtlPipelineStack103120251730(app, 'EtlPipelineStack103120251730', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const { GlueClient, StartJobRunCommand } = require('@aws-sdk/client-glue');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const glueClient = new GlueClient({});
const dynamoClient = new DynamoDBClient({});

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    try {
        for (const record of event.Records) {
            if (record.eventName.startsWith('ObjectCreated')) {
                await processFile(record.s3);
            }
        }
        
        return { statusCode: 200, body: 'Processing initiated' };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

async function processFile(s3Event) {
    const bucketName = s3Event.bucket.name;
    const objectKey = decodeURIComponent(s3Event.object.key.replace(/\+/g, ' '));
    
    console.log(`Processing file: ${objectKey} from bucket: ${bucketName}`);
    
    // Validate file extension
    if (!objectKey.endsWith('.parquet')) {
        console.log('Skipping non-parquet file');
        return;
    }
    
    const fileId = uuidv4();
    const timestamp = new Date().toISOString();
    
    try {
        // Create metadata record
        await createMetadataRecord(fileId, bucketName, objectKey, timestamp);
        
        // Start Glue job
        await startGlueJob(fileId, objectKey);
        
        console.log(`Successfully initiated processing for file: ${objectKey}`);
    } catch (error) {
        console.error(`Error processing file ${objectKey}:`, error);
        
        // Update metadata with error
        await updateMetadataWithError(fileId, error.message);
        throw error;
    }
}

async function createMetadataRecord(fileId, bucketName, objectKey, timestamp) {
    const params = {
        TableName: process.env.METADATA_TABLE,
        Item: {
            file_id: { S: fileId },
            source_file_path: { S: `s3://${bucketName}/${objectKey}` },
            processing_status: { S: 'INITIATED' },
            created_at: { S: timestamp },
            updated_at: { S: timestamp }
        }
    };
    
    await dynamoClient.send(new PutItemCommand(params));
    console.log(`Created metadata record for file ID: ${fileId}`);
}

async function startGlueJob(fileId, sourceKey) {
    const params = {
        JobName: process.env.GLUE_JOB_NAME,
        Arguments: {
            '--file_id': fileId,
            '--source_key': sourceKey
        }
    };
    
    const result = await glueClient.send(new StartJobRunCommand(params));
    console.log(`Started Glue job run: ${result.JobRunId}`);
    
    return result.JobRunId;
}

async function updateMetadataWithError(fileId, errorMessage) {
    try {
        const params = {
            TableName: process.env.METADATA_TABLE,
            Item: {
                file_id: { S: fileId },
                processing_status: { S: 'FAILED' },
                error_message: { S: errorMessage },
                updated_at: { S: new Date().toISOString() }
            }
        };
        
        await dynamoClient.send(new PutItemCommand(params));
    } catch (error) {
        console.error('Error updating metadata with error:', error);
    }
}

// config/azureBlob.config.js
import { BlobServiceClient } from '@azure/storage-blob';
import config from "../appConfig.js"


const isProduction = config.NODE_ENV === 'production';

const connectionString = isProduction 
  ? config.AZURE_BLOB_CONNECTION_STRING 
  : config.AZURE_BLOB_CONNECTION_STRING_UAT;

const containerName = isProduction 
  ? config.AZURE_BLOB_CONTAINER_NAME 
  : config.AZURE_BLOB_CONTAINER_NAME_UAT;

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

export const imageClient = blobServiceClient.getContainerClient(containerName);
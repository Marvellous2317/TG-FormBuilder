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

let blobServiceClient = null;
let imageClient = null;

if (connectionString) {
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  imageClient = blobServiceClient.getContainerClient(containerName);
} else {
  // console.warn('Azure Blob connection string is not configured. Blob storage features will be unavailable.');
}

export { blobServiceClient, imageClient };
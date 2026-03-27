
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { blobServiceClient, imageClient} from '../config/azureBlobConfig.js';
import { encryptBuffer, decryptBuffer,   extractBlobPath } from './cryptedUtili.js';



import { ApplicationError } from './errorHandler.js';
import crypto from "crypto"
import { fileTypeFromBuffer } from 'file-type';

 



export async function uploadFileToAzureBlob(file, fileName = "image") {
 
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    const buffer = file.buffer || (file.path ? await fs.promises.readFile(file.path) : null);
    if (!buffer) {
      throw new Error("Unable to read file buffer");
    }

    const ext = path.extname(file.originalname || ".pdf");
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const blobName = `${fileName}-${uniqueId}${ext}`;

    const createResponse = await imageClient.createIfNotExists();
    if (createResponse.succeeded) {
      await imageClient.setAccessPolicy("blob");
    }

    const blockBlobClient = imageClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: mime.lookup(ext) || "application/octet-stream",
      },
    });



    return {
      success: true,
      blobName,
      url: blockBlobClient.url,
    };
  } catch (error) {


    return {
      success: false,
      error: error.message || "File upload failed",
    };
  }
}














export async function deleteAzureBlob(blobUrl) {
  const url = new URL(blobUrl);
  const [, containerName, ...blobParts] = url.pathname.split('/');
  const blobName = blobParts.join('/');

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  await blobClient.deleteIfExists();
}




export async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => chunks.push(data));
    readableStream.on('end', () => resolve(Buffer.concat(chunks)));
    readableStream.on('error', reject);
  });
}



export function bufferToStream(buffer) {
  const stream = new PassThrough();
  stream.end(buffer);
  return stream;
}




export const AzureImageDownloader = async (fileUrl) => {


  try {
    const blobPath = decodeURIComponent(extractBlobPath(fileUrl));
    const [containerName, ...blobParts] = blobPath.split('/');
    const blobName = blobParts.join('/');

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadBlockBlobResponse = await blobClient.download();
    const file = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

    const type = await fileTypeFromBuffer(file);
    const extension = type?.ext || 'bin'; 
    const mime = type?.mime || 'application/octet-stream';

 
    const base64String = file.toString('base64');
    const dataUri = `data:${mime};base64,${base64String}`;


    return dataUri;
  } catch (error) {
    console.error("AzureImageDownloader error:", error);
    throw new ApplicationError(
      'Failed to download document'
    );
  }
};


export const AzureImageListDownloader = async (fileUrls) => {
  try {
    const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];

    const results = await Promise.all(
      urls.map(async (fileUrl) => {
        const blobPath = decodeURIComponent(extractBlobPath(fileUrl));
        const [containerName, ...blobParts] = blobPath.split('/');
        const blobName = blobParts.join('/');

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);

        const downloadBlockBlobResponse = await blobClient.download();
        const file = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

        const type = await fileTypeFromBuffer(file);
        const extension = type?.ext || 'bin';
        const mime = type?.mime || 'application/octet-stream';

        const base64String = file.toString('base64');
        return `data:${mime};base64,${base64String}`;
      })
    );


    return Array.isArray(fileUrls) ? results : results[0];
  } catch (error) {
    throw new ApplicationError('Failed to download document(s)');
  }
};

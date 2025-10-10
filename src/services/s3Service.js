const AWS = require('aws-sdk');
const logger = require('../utils/logger');

class S3Service {
  constructor() {
    // Configure AWS SDK
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1'
      });
      this.bucket = process.env.AWS_S3_BUCKET;
      this.enabled = true;
    } else {
      logger.warn('AWS credentials not configured. S3 storage disabled.');
      this.enabled = false;
    }
  }

  // Upload file to S3
  async upload(file, key, contentType) {
    if (!this.enabled) {
      throw new Error('S3 service not configured');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(params).promise();
      logger.info(`File uploaded to S3: ${result.Location}`);
      
      return {
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket
      };
    } catch (error) {
      logger.error('Error uploading to S3:', error);
      throw error;
    }
  }

  // Download file from S3
  async download(key) {
    if (!this.enabled) {
      throw new Error('S3 service not configured');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      const result = await this.s3.getObject(params).promise();
      return result.Body;
    } catch (error) {
      logger.error('Error downloading from S3:', error);
      throw error;
    }
  }

  // Delete file from S3
  async delete(key) {
    if (!this.enabled) {
      throw new Error('S3 service not configured');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
      logger.info(`File deleted from S3: ${key}`);
      return true;
    } catch (error) {
      logger.error('Error deleting from S3:', error);
      throw error;
    }
  }

  // Get signed URL for private files
  async getSignedUrl(key, expiresIn = 3600) {
    if (!this.enabled) {
      throw new Error('S3 service not configured');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
        Expires: expiresIn
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  // List files in bucket
  async listFiles(prefix = '') {
    if (!this.enabled) {
      throw new Error('S3 service not configured');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Prefix: prefix
      };

      const result = await this.s3.listObjectsV2(params).promise();
      return result.Contents.map(item => ({
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified
      }));
    } catch (error) {
      logger.error('Error listing S3 files:', error);
      throw error;
    }
  }
}

module.exports = new S3Service();

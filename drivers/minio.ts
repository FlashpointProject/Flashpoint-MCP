import { ContentHeaders, DriveFileStats, MinioDriverConfig, MinioDriverContract, Visibility } from '@ioc:Adonis/Core/Drive';
import * as minio from 'minio';
import { Readable } from 'stream';
import { FileNotFoundException } from '../Exceptions/FileNotFoundException';

export class MinioDriver implements MinioDriverContract {
  
  public name = 'minio';

  private bucket: string;
  
  private client: minio.Client;

  constructor (private config: MinioDriverConfig) {
    this.client = new minio.Client({
      endPoint: this.config.endPoint,
      port: parseInt(this.config.port),
      useSSL: !!this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
    });
    this.bucket = this.config.bucket;
  }

  setBucket(bucket: string) {
    this.bucket = bucket;
  }

  async exists(location: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, location);
      return true;
    } catch {
      return false;
    }
  }

  async getVisibility(): Promise<Visibility> {
    return 'public';
  }

  async setVisibility(): Promise<void> {}

  async getStats(location: string): Promise<DriveFileStats> {
    try {
      const stats = await this.client.statObject(this.bucket, location);
      return {
        size: stats.size,
        isFile: true,
        modified: stats.lastModified
      };
    } catch {
      throw FileNotFoundException.file(location);
    }

  }

  async delete(location: string): Promise<void> {
    return this.client.removeObject(this.bucket, location);
  }

  async get(location: string): Promise<Buffer> {
    const readable = this.client.getObject(this.bucket, location);
    return (await readable).read();
  }

  async getStream(location: string): Promise<NodeJS.ReadableStream> {
    const readable = this.client.getObject(this.bucket, location);
    return readable;
  }

  async put(location: string, contents: string | Buffer): Promise<void> {
    await this.client.putObject(this.bucket, location, contents);
  }

  async putStream(location: string, contents: NodeJS.ReadableStream): Promise<void> {
    await this.client.putObject(this.bucket, location, Readable.from(contents));
  }

  async copy(source: string, destination: string): Promise<void> {
    const conds = new minio.CopyConditions()
    conds.setModified(new Date())
    await this.client.copyObject(this.bucket, destination, source, conds);
  }

  async move(source: string, destination: string): Promise<void> {
    await this.copy(source, destination);
    await this.delete(source);
  }
  
  async getUrl(location: string): Promise<string> {
    const protocol = this.config.useSSL ? 'https' : 'http';
    const host = this.config.endPoint;
    const port = this.config.port;

    if ((protocol === 'http' && port === '80') || (protocol === 'https' && port === '443')) {
      return `${protocol}//${host}/${this.bucket}/${location}`
    } else {
      return `${protocol}//${host}:${port}/${this.bucket}/${location}`
    }
  }

  async getSignedUrl(location: string, options?: (ContentHeaders & { expiresIn?: string | number | undefined; }) | undefined): Promise<string> {
    if (await this.exists(location)) {
      const expiresIn = options?.expiresIn?.toString();
      const expiry = expiresIn ? parseInt(expiresIn) : 600;
      return this.client.presignedGetObject(this.bucket, location, expiry)
    } else {
      throw FileNotFoundException.file(location)
    }
  }
}

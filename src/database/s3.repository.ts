import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class S3Repository implements OnModuleInit {
  private readonly buckets: string[] = ['videos', 'photos'];
  private minioClient: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ROOT_USER')!,
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD')!,
    });
  }

  async onModuleInit() {
    await this.initializeBuckets(this.buckets);
  }

  async initializeBuckets(buckets: string[]) {
    for (const bucketName of buckets) {
      if (!(await this.minioClient.bucketExists(bucketName))) {
        await this.minioClient.makeBucket(bucketName);
      }
    }
  }

  async uploadFile(bucketName: string, filePath: string, file: any) {
    await this.minioClient.putObject(bucketName, filePath, file);
  }

  async downloadFile(bucketName: string, filePath: string) {
    const downloadStream = await this.minioClient.getObject(
      bucketName,
      filePath,
    );
  }

  async deleteFile(bucketName: string, filePath: string) {
    await this.minioClient.removeObject(bucketName, filePath);
  }
}

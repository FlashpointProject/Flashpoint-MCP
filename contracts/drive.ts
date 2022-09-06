/**
 * Contract source: https://git.io/JBt3I
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import { InferDisksFromConfig } from '@adonisjs/core/build/config';
import driveConfig from '../config/drive';

declare module '@ioc:Adonis/Core/Drive' {
  interface DisksList extends InferDisksFromConfig<typeof driveConfig> {}
  interface MinioDriverContract extends DriverContract {

  }
  type MinioDriverConfig = {
    driver: 'minio',
    endPoint: string,
    port: string,
    useSSL: boolean,
    accessKey: string,
    secretKey: string,
    bucket: string,
  }
  interface DriversList {
    minio: {
      implementation: MinioDriverContract
      config: MinioDriverConfig
    }
  }
}
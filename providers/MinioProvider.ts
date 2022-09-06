import { MinioDriver } from '../drivers/minio'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class MinioProvider {
  constructor(protected app: ApplicationContract) {}

  public boot() {
    this.app.container.withBindings(
      ['Adonis/Core/Drive'],
      (Drive) => {
        Drive.extend('minio', (_, __, config) => {
          return new MinioDriver(config)
        })
      }
    )
  }
}
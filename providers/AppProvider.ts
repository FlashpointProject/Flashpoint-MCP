import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { MinioDriver } from '../drivers/minio'
import SearchProvider from './SearchProvider'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    // Register your own bindings

  }

  public async boot() {
    // IoC container is ready
    const Drive = this.app.container.use('Adonis/Core/Drive')

    Drive.extend('minio', (_drive, _diskName, config) => {
      return new MinioDriver(config)
    })

    const search = new SearchProvider(this.app);
    search.boot();
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}

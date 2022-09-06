import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Search } from '../drivers/Search';

export default class SearchProvider {
  constructor(protected app: ApplicationContract) {}

  public boot() {
    // App is ready
    this.app.container.withBindings(
      ['Adonis/Core/Validator'], (Validator) => {
        this.app.container.singleton('Adonis/Addons/Search', () => {
          return (config) => {
            return new Search(config, Validator);
          };
        })
      }
    );
  }

  public async ready() {
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
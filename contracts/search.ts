declare module '@ioc:Adonis/Addons/Search' {
  import { ISearchConfig, SearchContract } from 'drivers/Search';

  export { SearchContract, ISearchConfig }

  const factory: (config: ISearchConfig) => SearchContract;
  export default factory;
}

declare module '@ioc:Adonis/Core/Application' {
  import { SearchContract, ISearchConfig } from '@ioc:Adonis/Addons/Search';
  export interface ContainerBindings {
    'Adonis/Addons/Search': (config: ISearchConfig) => SearchContract
  }
}
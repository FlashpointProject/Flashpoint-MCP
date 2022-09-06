import { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import { SearchCriteria } from './Parser';

export function createStringFilter(query: DatabaseQueryBuilderContract<any>, column: string, criteria: SearchCriteria, reverse: boolean, or: boolean) {
  switch (criteria.type) {
    case 'simple': {
      if (or) {
        return query.orWhere(column, reverse ? 'NOT LIKE' : 'LIKE', `%${criteria.value}%`);
      }
      return query.andWhere(column, reverse ? 'NOT LIKE' : 'LIKE', `%${criteria.value}%`);
    }
    case 'array' : {
      if (or) {
        return query.orWhere(column, reverse ? 'NOT LIKE ANY' : 'LIKE ALL', criteria.parts.map(p => `%${p}%`));
      }
      return query.andWhere(column, reverse ? 'NOT LIKE ANY' : 'LIKE ALL', criteria.parts.map(p => `%${p}%`));
    }
    default: {
      throw 'Impossible error!';
    }
  }
}

export function mapToCamelCase(dict: any): any {
  Object.keys(dict).map((key) => {
    const newKey = key.toLowerCase().replace(/([-_][a-z])/g, group =>
      group
        .toUpperCase()
        .replace('-', '')
        .replace('_', '')
      )
    if (newKey !== key) {
      dict[newKey] = dict[key];
      delete dict[key];
    }
  });
  return dict;
}
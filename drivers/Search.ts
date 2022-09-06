
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { parse, SearchCriteria, SearchQuery } from '../app/Parser';
import LRU from 'lru-cache';
import { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database'

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface ISearchConfig {
  // onSearchQueryParsed(query: any): void;
  createFilterQuery(): DatabaseQueryBuilderContract<any>;
  createCountQuery(): DatabaseQueryBuilderContract<any>;
  // finalizeQuery(): DatabaseQueryBuilderContract<any>;
  idColumn: string;
  defaultSort: {
    key: string;
    direction: SortDirection;
  };
  sortableColumns: Record<string, SortDirection>;

  generalFilter(query: DatabaseQueryBuilderContract<any>, criteria: SearchCriteria, reverse: boolean): DatabaseQueryBuilderContract<any>
  namedFilter(query: DatabaseQueryBuilderContract<any>, key: string, criteria: SearchCriteria, reverse: boolean): DatabaseQueryBuilderContract<any>
}

export interface SearchContract {
  cache: any;
  executeAndSerialize(ctx: HttpContextContract, serialize: (x: any) => any): Promise<any>;
}

export class Search implements SearchContract {
  cache: any;

  constructor(private config: ISearchConfig, private validator: any) {
    this.cache = new LRU({
      max: 100
    });
  }

  private async execute(query: string, offset: number, limit: number) {
    const searchQuery = parse(query);

    const cacheKey = JSON.stringify({ query, offset, limit });
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let filterQuery = this.config.createFilterQuery();
    filterQuery = this.prepareQuery(filterQuery, searchQuery, true);
    const entities = await filterQuery.offset(offset).limit(limit);

    let countQuery = this.config.createCountQuery();
    countQuery = this.prepareQuery(countQuery, searchQuery, false);
    const count = (await countQuery.count('* as total'))[0]['total'] || 0; 

    const res = {
      count,
      entities
    };
    this.cache.set(cacheKey, res);
    return res;
  }
  
  async executeAndSerialize<T>(ctx: HttpContextContract, serialize: (x: any) => T) {
    const querySchema = this.validator.schema.create({
      query: this.validator.schema.string.optional(),
      offset: this.validator.schema.number.optional(),
      limit: this.validator.schema.number.optional(),
    });
    const { query = '', offset = 0, limit = 100 } = await ctx.request.validate({ schema: querySchema });
    const { count, entities } = await this.execute(query, offset, limit);
    return {
      query,
      offset,
      limit,
      total: count,
      results: entities.map(serialize)
    }
  }

  prepareQuery(query: DatabaseQueryBuilderContract<any>, searchQuery: SearchQuery, sort: boolean): DatabaseQueryBuilderContract<any> {
    for (const token of searchQuery.generalTokens) {
      query = this.config.generalFilter(query, token.criteria, token.reverse);
    }
    for (const token of searchQuery.namedTokens) {
      query = this.config.namedFilter(query, token.key, token.criteria, token.reverse);
    }
    if (sort) {
      for (const token of searchQuery.sortTokens) {
        if (this.config.sortableColumns[token.key]) {
          let direction = getDirection(token.order, this.config.sortableColumns[token.key]);
          query = query.orderBy(token.key, direction);
        } else {
          throw `Invalid sort key, must be of kind [${Object.keys(this.config.sortableColumns).join(', ')}]`;
        }
      }
      if (searchQuery.sortTokens.length === 0) {
        query.orderBy(this.config.defaultSort.key, this.config.defaultSort.direction);
      }
    }
    return query;
  }
}

function getDirection(dir: SortDirection, defaultDir: SortDirection): SortDirection {
  if (defaultDir === dir) {
    return defaultDir;
  } else {
    if (defaultDir === SortDirection.ASC) {
      return SortDirection.DESC;
    } else {
      return SortDirection.ASC;
    }
  }
}
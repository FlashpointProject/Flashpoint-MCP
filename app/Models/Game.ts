import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm';
import { SearchCriteria } from 'App/Parser';
import { createStringFilter } from 'App/Util';
import { ISearchConfig, SortDirection } from '../../drivers/Search';
import { DateTime } from 'luxon';
import Tag from './Tag';

export default class Game extends BaseModel {
  static get table () {
    return 'game'
  }

  @column({ isPrimary: true })
  public id: string

  @column()
  public library: string;

  @column()
  public title: string;

  @column()
  public alternateTitles: string;

  @column()
  public developer: string;

  @column()
  public publisher: string;

  @column()
  public platform: string;

  @column()
  public series: string;

  @column()
  public playMode: string;

  @column()
  public status: string;

  @column()
  public source: string;

  @column()
  public releaseDate: string;

  @column()
  public language: string;

  @column()
  public version: string;

  @column()
  public applicationPath: string;

  @column()
  public launchCommand: string;

  @column()
  public originalDescription: string;

  @column()
  public notes: string;

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>

  @column()
  public tagsStr: string;

  @column()
  public logo: string;

  @column()
  public screenshot: string;

  @column.dateTime({ autoCreate: true })
  public dateAdded: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public dateModified: DateTime
}

export class GameSearchConfig implements ISearchConfig {
  idColumn: string = 'id';
  defaultSort = {
    key: 'title',
    direction: SortDirection.ASC
  };
  sortableColumns = {
    title: SortDirection.ASC,
    developer: SortDirection.ASC
  };
  namedAliases = [
    {
      key: 'tags_str',
      aliases: ['tag']
    }
  ]

  createCountQuery(): DatabaseQueryBuilderContract<any> {
    return Database.query().from('game')
  }

  createFilterQuery(): DatabaseQueryBuilderContract<any> {
    return Database.query().from('game')
  }

  finalizeQuery(query: DatabaseQueryBuilderContract<any>): DatabaseQueryBuilderContract<any> {
    return query.orderBy('title', 'asc');
  }

  generalFilter(query: DatabaseQueryBuilderContract<any>, criteria: SearchCriteria, reverse: boolean): DatabaseQueryBuilderContract<any> {
    query = createStringFilter(query, 'title', criteria, reverse, false);
    // query = createStringFilter(query, 'alternate_titles', criteria, reverse, true);
    // query = createStringFilter(query, 'developer', criteria, reverse, true);
    // query = createStringFilter(query, 'publisher', criteria, reverse, true);
    // query = createStringFilter(query, 'series', criteria, reverse, true);
    return query;
  }

  namedFilter(query: DatabaseQueryBuilderContract<any>, key: string, criteria: SearchCriteria, reverse: boolean): DatabaseQueryBuilderContract<any> {
    const namedKey = this.namedAliases.find(a => a.aliases.includes(key));
    return createStringFilter(query, namedKey ? namedKey.key : key, criteria, reverse, false);
  }
}
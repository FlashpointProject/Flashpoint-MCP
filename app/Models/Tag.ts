import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import TagAlias from './TagAlias';
import TagCategory from './TagCategory';
import { ISearchConfig } from '@ioc:Adonis/Addons/Search';
import { SortDirection } from '../../drivers/Search';
import Database, { DatabaseQueryBuilderContract } from '@ioc:Adonis/Lucid/Database';
import { createStringFilter } from '../Util';
import { SearchCriteria } from '../Parser';

export default class Tag extends BaseModel {
  static get table () {
    return 'tag'
  }

  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column()
  public name: string;

  @hasMany(() => TagAlias)
  public aliases: HasMany<typeof TagAlias>

  @belongsTo(() => TagCategory, { foreignKey: 'categoryId' })
  public category: BelongsTo<typeof TagCategory>

  @column({ serializeAs: null })
  public categoryId: number;

  @column.dateTime({ autoCreate: true })
  public dateAdded: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public dateModified: DateTime
}

export class TagSearchConfig implements ISearchConfig {
  idColumn: string = 'id';
  defaultSort = {
    key: 'name',
    direction: SortDirection.ASC
  };
  sortableColumns = {
    title: SortDirection.ASC,
    developer: SortDirection.ASC
  };

  createCountQuery(): DatabaseQueryBuilderContract<any> {
    return Database.query().from('tag_alias')
    //.distinctOn(['tag.name'])
    .leftJoin('tag', 'tag.id', 'tag_alias.tag_id')
    .leftJoin('tag_category', 'tag.category_id', 'tag_category.id');
  }

  createFilterQuery(): DatabaseQueryBuilderContract<any> {
    return Database.query().select(['tag.name as name', 'tag.date_added', 'tag.date_modified', 'tag_category.name as category'])
    .from('tag_alias')
    .distinctOn(['tag.name'])
    .leftJoin('tag', 'tag.id', 'tag_alias.tag_id')
    .leftJoin('tag_category', 'tag.category_id', 'tag_category.id');
  }

  finalizeQuery(query: DatabaseQueryBuilderContract<any>): DatabaseQueryBuilderContract<any> {
    return query.orderBy('name', 'asc');
  }

  generalFilter(query: DatabaseQueryBuilderContract<any>, criteria: SearchCriteria, reverse: boolean): DatabaseQueryBuilderContract<any> {
    return createStringFilter(query, 'tag_alias.name', criteria, reverse, false);
  }

  namedFilter(query: DatabaseQueryBuilderContract<any>, key: string, criteria: SearchCriteria, reverse: boolean): DatabaseQueryBuilderContract<any> {
    // const namedKey = this.namedAliases.find(a => a.aliases.includes(key));
    // return createStringFilter(query, namedKey ? namedKey.key : key, criteria, reverse, false);
    return query;
  }
}
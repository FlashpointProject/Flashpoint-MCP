import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import Tag from './Tag';

export default class TagAlias extends BaseModel {
  static get table () {
    return 'tag_alias'
  }

  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column()
  public name: string;

  @column()
  public tagId: number;

  @belongsTo(() => Tag)
  public tag: BelongsTo<typeof Tag>
}

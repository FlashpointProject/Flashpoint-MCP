import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class TagCategory extends BaseModel {
  static get table () {
    return 'tag_category'
  }

  @column({ isPrimary: true, serializeAs: null })
  public id: number

  @column()
  public name: string;

  @column()
  public description: string;

  @column()
  public color: string;

  @column.dateTime({ autoCreate: true })
  public dateAdded: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public dateModified: DateTime
}

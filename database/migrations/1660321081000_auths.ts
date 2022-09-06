import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AuthsSchema extends BaseSchema {
  protected tableName = 'auths'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })

    this.schema.createTable('api_tokens', (table) => {
      table.increments('id').primary()
      table.string('name')
      table.string('token');
      table.string('type')
      table.integer('user_id').references('auths.id')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable('api_tokens')
    this.schema.dropTable(this.tableName)
  }
}

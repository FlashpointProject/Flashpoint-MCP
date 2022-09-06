import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {

  public async up () {
    this.schema.createTable('tag_category', (table) => {
      table.increments('id');
      table.specificType('name', 'citext');
      table.specificType('color', 'citext');
      table.specificType('description', 'citext').defaultTo("");
      table.timestamp('date_added', { useTz: true })
      table.timestamp('date_modified', { useTz: true })
      table.unique(['name']);
    });

    this.schema.createTable('tag', (table) => {
      table.increments('id');
      table.integer('category_id')
        .unsigned()
        .references('tag_category.id')
        .onDelete('CASCADE');
      table.specificType('name', 'citext');
      table.timestamp('date_added', { useTz: true })
      table.timestamp('date_modified', { useTz: true })
      table.unique(['name']);
    });

    this.schema.createTable('tag_alias', (table) => {
      table.increments('id');
      table.integer('tag_id')
        .unsigned()
        .references('tag.id')
        .onDelete('CASCADE');
      table.specificType('name', 'citext');
      table.timestamp('date_added', { useTz: true })
      table.unique(['name']);
    });

    this.schema.createTable('game', (table) => {
      table.uuid('id')
        .primary()
        .defaultTo(this.db.rawQuery('uuid_generate_v4()').knexQuery)

      table.specificType('library', 'citext').defaultTo("");
      table.specificType('title', 'citext').notNullable();
      table.specificType('alternate_titles', 'citext').defaultTo("");
      table.specificType('developer', 'citext').defaultTo("");
      table.specificType('publisher', 'citext').defaultTo("");
      table.specificType('platform', 'citext').defaultTo("");
      table.specificType('series', 'citext').defaultTo("");
      table.specificType('play_mode', 'citext').defaultTo("");
      table.specificType('status', 'citext').defaultTo("");
      table.specificType('source', 'citext').defaultTo("");
      table.specificType('release_date', 'citext').defaultTo("");
      table.specificType('language', 'citext').defaultTo("");
      table.specificType('version', 'citext').defaultTo("");
      table.specificType('application_path', 'citext').notNullable();
      table.specificType('launch_command', 'citext').notNullable();
      table.specificType('original_description', 'citext').defaultTo("");
      table.specificType('notes', 'citext').defaultTo("");
      table.specificType('tags_str', 'citext').defaultTo("");
      table.string('logo');
      table.string('screenshot');
      table.string('data_pack');

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('date_added', { useTz: true })
      table.timestamp('date_modified', { useTz: true })
    });

    this.schema.createTable('game_tag', (table) => {
      table.increments('id');
      table.uuid('game_id')
        .references('game.id')
        .onDelete('CASCADE');
      table.integer('tag_id')
        .unsigned()
        .references('tag.id')
        .onDelete('CASCADE');
      table.unique(['game_id', 'tag_id'])
    });
  }

  public async down () {
    this.schema.dropTable('game_tag')
    this.schema.dropTable('game')
    this.schema.dropTable('tag_alias')
    this.schema.dropTable('tag')
    this.schema.dropTable('tag_category')
  }
}

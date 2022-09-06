import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  PG_HOST: Env.schema.string({ format: 'host' }),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string(),
  ES_URL: Env.schema.string()
})
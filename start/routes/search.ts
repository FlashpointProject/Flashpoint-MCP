import Route from '@ioc:Adonis/Core/Route';
import { parse } from 'App/Parser';

Route.get('/search/test', async (ctx) => {
  const { query } = ctx.request.qs();
  return {
    originalQuery: query,
    query: parse(query)
  };
});
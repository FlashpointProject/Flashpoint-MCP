import Route from '@ioc:Adonis/Core/Route'
import Tag, { TagSearchConfig } from 'App/Models/Tag'
import TagAlias from 'App/Models/TagAlias';
import TagCategory from 'App/Models/TagCategory'
import SearchFactory from '@ioc:Adonis/Addons/Search';
import { mapToCamelCase } from '../../app/Util';

const tagSearch = SearchFactory(new TagSearchConfig());

function serializeTag(tag: Tag, category: TagCategory) {
  return {
    ...tag.serialize(),
    aliases: tag.aliases.map(a => a.name),
    category: category.name
  };
}

Route.get('/tags', async (ctx) => {
  return tagSearch.executeAndSerialize(ctx, (data) => {
    const tag = new Tag();
    Object.assign(tag, mapToCamelCase(data));
    return mapToCamelCase(data);
  })
  .then((res) => {
    console.log('returning result with ' + res.results.length + ' results')
    return ctx.response.ok(res);
  })
  .catch((err) => {
    return ctx.response.badRequest({ error: err })
  });
})

Route.get('/tags/:name', async ({ request, response }) => {
  const { name } = request.params();
  try {
    const alias = await TagAlias.findBy('name', name);
    if (alias) {
      await alias.load('tag');
      await alias.tag.load('category');
      await alias.tag.load('aliases');
      return serializeTag(alias.tag, alias.tag.category);
    } else {
      response.status(404);
    }
  } catch (err) {
    response.status(500);
    console.log(err);
    return { error: err };
  }
})

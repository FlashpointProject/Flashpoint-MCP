import Drive from '@ioc:Adonis/Core/Drive'
import Route from '@ioc:Adonis/Core/Route'
import { schema, validator } from '@ioc:Adonis/Core/Validator'
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import Game, { GameSearchConfig } from 'App/Models/Game'
import Tag from 'App/Models/Tag'
import TagAlias from 'App/Models/TagAlias'
import TagCategory from 'App/Models/TagCategory'
import SearchFactory from '@ioc:Adonis/Addons/Search';
import { mapToCamelCase } from '../../app/Util'

const gameSearch = SearchFactory(new GameSearchConfig());

const createGameSchema = schema.create({
  id: schema.string.optional(),
  title: schema.string(),
  library: schema.string(),
  alternateTitles: schema.string.optional(),
  developer: schema.string.optional(),
  publisher: schema.string.optional(),
  series: schema.string.optional(),
  dateAdded: schema.date.optional(),
  dateModified: schema.date.optional(),
  platform: schema.string(),
  playMode: schema.string.optional(),
  status: schema.string.optional(),
  notes: schema.string.optional(),
  source: schema.string.optional(),
  applicationPath: schema.string(),
  launchCommand: schema.string(),
  releaseDate: schema.string.optional(),
  version: schema.string.optional(),
  originalDescription: schema.string.optional(),
  language: schema.string.optional(),
  tags: schema.array.optional().members(schema.string()),
})

Route.get('/games', async (ctx) => {
  return gameSearch.executeAndSerialize(ctx, (data) => {
    const game = new Game();
    Object.assign(game, mapToCamelCase(data));
    return game.serialize();
  })
  .then((res) => {
    return ctx.response.ok(res);
  })
  .catch((err) => {
    return ctx.response.badRequest({ error: err })
  });
})

Route.get('/games/:id', async ({ request, response }) => {
  const { load } = request.qs();
  const { id } = request.params();
  try {
    const game = await Game.find(id);
    if (game) {
      if (load) {
        await game.load('tags');
      }
      return game;
    } else {
      response.status(404);
    }
  } catch (err) {
    if (err.routine === 'string_to_uuid') {
      response.status(400);
      return { error: 'Invalid ID format' }
    } else {
      response.status(500);
    }
  }
});

Route.post('/games/:id/media', async ({ auth, request, response }) => {
  await auth.use('api').authenticate();
  const { id } = request.params();
  const logo = request.file('logo', { extnames: ['png'] });
  const screenshot = request.file('screenshot', { extnames: ['png'] });

  // Check for any validation errors
  if (logo && !logo.isValid) {
    return { error: logo.errors };
  }
  if (screenshot && !screenshot.isValid) {
    return { error: screenshot.errors };
  }

  // Load the game we're going to be updating
  const game = await Game.find(id);
  
  if (game) {
    try {
      // Save Logo and Screenshot to disk, update game with name
      if (logo) {
        await logo.moveToDisk(`/games/${game.id}/media/`, { name: 'logo.png' });
        game.logo = logo.fileName || '';
      }
      if (screenshot) {
        await screenshot.moveToDisk(`/games/${game.id}/media/`, { name: 'screenshot.png' });
        game.screenshot = screenshot.fileName || '';
      }
    }
    catch (err) {
      console.error(err);
      return response.internalServerError({ error: 'Error saving images' })
    }
    return game.save();
  } else {
    response.status(404);
  }

});

Route.post('/games', async ({ auth, request, response }) => {
  await auth.use('api').authenticate();
  let games: any[] = [];
  const parseErrors: any[] = [];
  const body = request.body()
  if (Array.isArray(body)) {
    for (const obj of body) {
      try {
        const data = await validator.validate({ schema: createGameSchema, data: obj });
        games.push(data);
      } catch (err) {
        parseErrors.push(obj);
        throw {
          error: 'Parse error'
        };
      }
    }
  } else {
    games.push(await request.validate({ schema: createGameSchema }));
  }
  
  try {
    const savedGames = await Database.transaction(async (trx) => {
      // Parse in series to avoid category conflicts
      const saved: Game[] = [];
      for (const payload of games) {
        const gameTags = await schemaToTags(payload, trx);
        const game = await Game.create({ ...payload, tagsStr: gameTags.map(t => t.name).sort().join('; ') }, trx);
        await game.useTransaction(trx).related('tags').createMany(gameTags);
        await Game.find(game.id)
        .then((g) => {
          if (g) {
            saved.push(g);
          }
        });
      }
      return saved;
    });
    if (savedGames.length === 1) {
      return savedGames[0]?.serialize();
    } else {
      return {
        results: savedGames.map(g => g?.serialize())
      }
    }
  } catch (err) {
    console.error(err)
    response.status(400);
    return {
      error: err,
      parse_errors: parseErrors
    };
  }

})

async function schemaToTags(payload: typeof createGameSchema['props'], trx: TransactionClientContract): Promise<Tag[]> {
  let tags: Tag[] = [];
  if (payload.tags) {
    // Find default tag category
    const category = await TagCategory.firstOrCreate({
      name: 'default',
      color: '#FFFFFF'
    });
    // Validate tags
    for (const tagStr of payload.tags) {
      const alias = await TagAlias.findBy('name', tagStr);
      if (!alias) {
        // Alias doesn't exist, create a new one
        const newTag = await Tag.create({
          categoryId: category.id,
          name: tagStr
        }, trx);
        await TagAlias.create({
          name: tagStr,
          tagId: newTag.id
        }, trx);
        tags.push(newTag);
      } else {
        await alias.load('tag');
        tags.push(alias.tag);
      }
    }
  }
  return tags;
}

Route.get('/games/:id/media/:type', async ({ request, response }) => {
  const { id, type } = request.params();

  const game = await Game.find(id);
  if (game) {
    switch (type) {
      case 'logo': {
        if (game.logo) {
          const readableStream = await Drive.getStream(game.logo)
          response.stream(readableStream);
        } else {
          response.status(404);
        }
        break;
      }
      case 'screenshot': {
        if (game.screenshot) {
          const readableStream = await Drive.getStream(game.screenshot)
          response.stream(readableStream);
        } else {
          response.status(404);
        }
        break;
      }
    }

  } else {
    response.status(404);
  }

});

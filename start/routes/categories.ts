import Route from '@ioc:Adonis/Core/Route';
import TagCategory from 'App/Models/TagCategory';

Route.get('/categories/:name', async ({ request, response }) => {
  const { name } = request.params();
  try {
    const category = await TagCategory.findBy('name', name);
    if (category) {
      return category;
    } else {
      response.status(404);
    }
  } catch (err) {
    response.status(500);
    console.log(err);
    return { error: err };
  }
});

Route.get('/categories', async () => {
  return TagCategory.all();
});
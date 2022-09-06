import Route from '@ioc:Adonis/Core/Route';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import Database from '@ioc:Adonis/Lucid/Database';
import Auth from 'App/Models/Auth';
import { registrationKey } from 'Config/app';

Route.post('/login', async ({ auth, request, response }) => {
  const email = request.input('email')
  const password = request.input('password')

  try {
    const token = await auth.use('api').attempt(email, password);
    return token.toJSON();
  } catch (err) {
    console.error(err);
    return response.unauthorized('Invalid credentials');
  }
})

Route.post('/logout', async ({ auth, response }) => {
  try {
    await auth.use('api').authenticate();
    await Database.rawQuery('DELETE FROM api_tokens WHERE user_id = ?', [auth.user!.id])
  } catch (err) {
    // Auth failed, no user logged in
  } finally {
    await auth.use('api').revoke()
  }
  return response.status(200);
})

Route.post('/register', async ({ request, response }) => {
  // Are we expecting registrations?
  if (registrationKey) {
    const givenRegKey = request.input('registrationKey')

    if (givenRegKey === registrationKey) {
      const userValidation = schema.create({
        email: schema.string({}, [rules.unique({ table: 'auths', column: 'email' })]),
        password: schema.string({}, [rules.minLength(8)])
      });
      const data = await request.validate({ schema: userValidation });
      
      try {
        const user = await Auth.create({ email: data.email, password: data.password })
        return response.created(user);
      } catch (err) {
        console.error(err);
        return response.internalServerError();
      }
    } else {
      response.status(400);
      return {
        error: 'Incorrect registration key'
      }
    }
  } else {
    return response.unauthorized('Registrations not open');

  }
})

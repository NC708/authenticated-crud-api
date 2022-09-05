/**
 * @api {post} /register Register new user.
 * @apiGroup Authentication
 * @apiBody {String} email User's email
 * @apiBody {String} username User's desired username
 * @apiBody {String} pass User's desired password
 * @apiSuccess {String} message Message confirming successful registration.
 */

import bc from 'bcrypt';
import { client } from '../../db';

async function createUser(
  email: string,
  username: string,
  passHash: string,
  sigSalt: string,
  formId: string
) {
  try {
    await client.query(
      'INSERT INTO users(email, username, passHash, sigSalt, formId) VALUES ($1, $2, $3, $4, $5)',
      [email, username, passHash, sigSalt, formId] //Issuing queries like this protects against sql injection
    );
    console.log(`User ${username} registered.`);
  } catch (err) {
    throw err;
  }
}

const options = {
  schema: {
    description:
      'Register a new user.\n\nRequests should contain the user\'s email, username, password ("pass"), and password-check ("passCheck"). Password and password-check must match. Applicant email and username must be unique.',
    response: {
      default: {
        $ref: 'JSONmessage#',
      },
    },
  },
};

async function handler(req: any, res: any, done: Function) {
  const { email, username, pass } = req.body;
  if (!(email && username && pass)) {
    return res.status(400).send({ message: 'Missing information' });
  }
  const passHash = bc.hash(pass, 12);
  const sigSalt = Math.random().toString(36).substring(2); //sigSalt is concatenated to the server's secret key before signing a user's JWT.
  //Changing a users sigSalt renders all of the user's previously-issued JWTs invalid (universal logout).
  //See lib/queries/universalLogout.ts for more :)
  const formId = Math.random().toString(36).substring(2); //formId is used for protection against CSRF. it should be embedded in forms
  //and sent to the server with each request.

  console.log('random:  ', formId);
  try {
    await createUser(email, username, await passHash, await sigSalt, formId);
    return res.status(200).send({ message: 'User succesfully registered' });
  } catch (err) {
    return res.status(400).send({ message: `Error registering user: ${err}` });
  }
}

export { handler as default, options };

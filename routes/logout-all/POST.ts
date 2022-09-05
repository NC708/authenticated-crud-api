/**
 * @api {post} /logout-all Logout user from all browsers.
 * @apiGroup Authentication
 * @apiSuccess {String} message Message confirming successful universal logout.
 */

import verifyToken from '../../lib/verifyToken';
const bc = require('bcrypt');
import { client } from '../../db';

async function universalLogout(email: string) {
  try {
    const sigSalt = await bc.genSalt(5);
    client.query('UPDATE users SET sigsalt = $1 WHERE email = $2', [
      sigSalt,
      email,
    ]);
  } catch (err) {
    throw err;
  }
}

const options = {
  schema: {
    response: {
      default: {
        $ref: 'JSONmessage#',
      },
    },
  },
  preHandler: verifyToken,
};

async function handler(req: any, res: any, done: Function) {
  try {
    await universalLogout(req.user.email);
    return res
      .clearCookie('authToken')
      .status(200)
      .send({ message: 'Successfully logged out' });
  } catch (err) {
    return res.status(400).send({ message: `Internal error: ${err}` });
  }
}

export { handler as default, options };

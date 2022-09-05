import { decode, verify } from 'jsonwebtoken';
import { client } from '../db';

async function getUser(email: string) {
  try {
    return (await client.query('SELECT * FROM users WHERE email = $1', [email]))
      ?.rows[0];
  } catch (err) {
    throw err;
  }
}

export default async function (req: any, res: any, done: Function) {
  try {
    const testing = true; // Enable/disable CSRF protection
    const authToken = req.unsignCookie(req.cookies.authToken).value;
    const user = await getUser((decode(authToken) as any).email);
    const valid =
      verify(authToken, process.env.SECRET_KEY + user.sigsalt) &&
      (testing || user.formid == req.query.formId);
    if (valid) {
      req.user = user;
    } else {
      return res.status(400).send({ message: 'Bad credentials' });
    }
  } catch (err) {
    return res.status(400).send({ message: 'Invalid auth data' });
  }
}

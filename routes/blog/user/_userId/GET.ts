/**
 * @api {get} /blog/user/:userId Fetch a list of publications by a specific user.
 * @apiGroup Blog
 * @apiQuery {String} cursor [OPTIONAL]  Base-64 encoded JSON object which specifies a
 * publication date, list size (limit 25 publications per request), and lastId.
 * A cursor is generated by the server if one is not provided. This will return the latest
 * 25 publications by the specified user.
 * @apiparam {Number} userId ID of the author of interest.
 * @apiSuccess {String} cursor base-64 encoded cusor object
 * @apiSuccess {Number} id Publication ID
 * @apiSuccess {String} title Title of publication
 * @apiSuccess {Number} author Author's ID
 * @apiSuccess {String} content Main content of publication, optionally formatted with html.
 * @apiSuccess {Date/time} creation_ts Date and time of publication release
 * @apiSuccessExample  Example success response:
 * {
 * "cursor": "eyJ0aW1lc3RhbXAiOiIyMDIyLTA2LTIwVDE2OjA1OjMwLjA2N1oiLCJsYXN0SWQiOjN9",
 * "pubs": [
 *    "id": 4,
 *    "title": "Networking 101",
 *    "author": 4,
 *    "content": "<p>Networking sucks, don't do it.</p>",
 *    "creation_ts": "2022-06-16T16:30:12.656Z"
 * ]
 * }
 */

import decodeCursor from '../../../../utils/decodeCursor';
import encodeCursor from '../../../../utils/encodeCursor';
import { client } from '../../../../db';

async function getPubs(args: any) {
  try {
    let { userId, cursor } = args;
    if (cursor) cursor = decodeCursor(cursor);
    cursor = cursor
      ? cursor
      : { timestamp: new Date(Date.now()), lastId: 9999999 };
    let results = [];
    results = (
      await client.query(
        `SELECT * FROM pubs WHERE author = $1 AND creation_ts < $2 AND id < $3 ORDER BY id LIMIT $4`,
        [
          userId,
          cursor.timestamp,
          cursor.lastId,
          Math.min(cursor.limit ? cursor.limit : 25, 25),
        ]
      )
    ).rows;
    cursor.lastId = results[0]?.id || 9999999;
    cursor = encodeCursor(cursor);
    return { cursor: cursor, pubs: results };
  } catch (err) {
    throw err;
  }
}

const options = {
  schema: {
    params: { userId: { type: 'number' } },
    querystring: { cursor: { type: 'string' } },
    response: {
      200: {
        $ref: 'publications#',
      },
      400: {
        $ref: 'JSONmessage#',
      },
    },
  },
};

async function handler(req: any, res: any) {
  try {
    const { userId } = req.params;
    const { cursor } = req.query;
    const pubs = await getPubs({ userId: userId, cursor: cursor });
    return res.status(200).send(pubs);
  } catch (err) {
    res.status(400).send({ message: `Error fetching publications: ${err}` });
  }
}

export { handler as default, options };

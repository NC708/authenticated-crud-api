/**
 * @api {get} /blog/pub/:pubId Fetch a publication by its ID.
 * @apiGroup Blog
 * @apiParam {Number} pubId Publication ID
 * @apiSuccess {Number} id Publication ID
 * @apiSuccess {String} title Title of publication
 * @apiSuccess {Number} author Author's ID
 * @apiSuccess {String} content Main content of publication, optionally formatted with html.
 * @apiSuccess {Date/time} creation_ts Date and time of publication release
 * @apiSuccessExample  Example success response:
 * {
 * "id": 4,
 * "title": "Networking 101",
 * "author": 4,
 * "content": "<p>Networking sucks, don't do it.</p>",
 * "creation_ts": "2022-06-16T16:30:12.656Z"
 * }
 */

import { client } from '../../../../db';

async function getPub(pubId: number) {
  try {
    return (await client.query('SELECT * FROM pubs WHERE id = $1', [pubId]))
      .rows[0];
  } catch (err) {
    throw err;
  }
}

const options = {
  schema: {
    params: { pubId: { type: 'number' } },
    response: {
      200: {
        $ref: 'publication#',
      },
      400: {
        $ref: 'JSONmessage#',
      },
    },
  },
};

async function handler(req: any, res: any) {
  try {
    const { pubId } = req.params;
    const publication = await getPub(pubId);
    if (!publication)
      return res
        .status(400)
        .send({ message: `Publication #${pubId} does not exist` });
    else return res.status(200).send(publication);
  } catch (err) {
    res.status(400).send({ message: `Error fetching publication: ${err}` });
  }
}

export { handler as default, options };

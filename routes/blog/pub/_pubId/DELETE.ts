/**
 * @api {delete} /blog/pub/:pubId Delete a publication.
 * @apiGroup Blog
 * @apiParam {Number} pubId Publication ID
 * @apiSuccess {String} message Success message
 * @apiSuccessExample  Example success message:
 * {
 * "message": "Publication #15 successfully deleted.""
 * }
 */

import verifyToken from '../../../../lib/verifyToken';
import { client } from '../../../../db';

async function deletePub(userId: number, pubId: number) {
  try {
    //Avoids making 2 requests to db by checking for matching user id within the query
    const { rowCount } = await client.query(
      'DELETE FROM pubs WHERE id = $1 AND author = $2',
      [pubId, userId]
    );
    //Precisely one post should be deleted per query...
    if (rowCount < 1)
      throw `Publication #${pubId} does not belong to user #${userId}`;
  } catch (err) {
    throw err;
  }
}

const options = {
  schema: {
    params: { pubId: { type: 'number' } },
    response: {
      default: {
        $ref: 'JSONmessage#',
      },
    },
  },
  preHandler: verifyToken,
};

async function handler(req: any, res: any) {
  try {
    await deletePub(req.user.id, req.params.pubId);
    res.status(200).send({
      message: `Publication #${req.params.pubId} successfully deleted.`,
    });
  } catch (err) {
    res.status(400).send({ message: `Error deleting publication: ${err}` });
  }
}

export { handler as default, options };

/**
 * @api {post} /logout Logout user from current browser.
 * @apiGroup Authentication
 * @apiSuccess {String} message Message confirming successful logout.
 */

const options = {
  schema: {
    response: {
      default: { $ref: 'JSONmessage' },
    },
  },
};

async function handler(req: any, res: any, done: Function) {
  return res
    .clearCookie('authToken')
    .status(200)
    .send({ message: 'Successfully logged out' });
}

export { handler as default, options };

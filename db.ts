const { Client } = require('pg');
require('dotenv').config();

const client = new Client(process.env.PG_URL);

async function connect() {
  try {
    await client.connect();
    console.log('Succesfully connected to database...');
  } catch (err) {
    throw err;
  }
}

export { connect, client };

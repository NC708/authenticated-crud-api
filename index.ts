import { fastify as serverFactory } from 'fastify';
const fastify = serverFactory({ logger: false });
import cookie from '@fastify/cookie';
import { connect } from './db';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

let routes: object[] = [];

//Route Factory | uses depth-first search on 'routes' folder to define all routes.
//Method, url, and handler defined according to each file's name, directory, and default export respectively
function recursiveRouteSearch(directory: string) {
  const entries = fs.readdirSync(directory);
  entries.forEach((entry: string) => {
    //For each entry, recurse or add route
    const fullPath = path.join(directory, entry);
    if (fs.lstatSync(fullPath).isDirectory())
      recursiveRouteSearch(fullPath); //Recurse if item is directory
    else {
      const parsedPath = path.parse(fullPath); //Parse the full path of files
      const parsedDir: Array<string> = parsedPath.dir.split(process.platform == 'win32' ? '\\' : '/');
      const method = parsedPath.name;
      const url = '/' + parsedDir.splice(1).join('/');
      const handler = require('./' + fullPath).default;
      const options = require('./' + fullPath).options || null;
      const routeConfig = {
        method: method,
        url: url,
        handler: handler,
        ...options,
      };

      fastify.route(routeConfig); //Establishes route
      return routes.push(routeConfig); //Adds route to routes array for convenience
    }
  });
}

async function start() {
  try {
    //Connect to database
    await connect();

    //Cookie plugin
    await fastify.register(cookie, { secret: process.env.COOKIE_KEY });

    //Common schemas
    fastify.addSchema({
      $id: 'JSONmessage',
      description: 'Testing',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    });
    fastify.addSchema({
      $id: 'publication',
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        author: { type: 'number' },
        content: { type: 'string' },
        creation_ts: { type: 'string', format: 'date-time' },
      },
    });
    fastify.addSchema({
      $id: 'publications',
      type: 'object',
      properties: {
        cursor: { type: 'string' },
        pubs: { type: 'array', items: { $ref: 'publication#' } },
      },
    });

    await recursiveRouteSearch('routes');
    await fastify.ready();
    fastify.listen({ port: 3500 }); //Start server
    console.log(
      `Succesfully started server... \nLIVE ROUTES: ${routes.map(
        (route: any) => `\n METHOD: ${route.method}\tURL: ${route.url}`
      )}`
    );
  } catch (err) {
    console.log(`Failed to start server: \n${err}\n`);
  }
}

start();

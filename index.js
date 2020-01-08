require('source-map-support').install();

const express = require('express');
const morgan = require('morgan');
const getPort = require('get-port');
const toLambda = require('./expressToLambda');
const getMockedContext = require('./getMockedContext');
const assert = require('assert');

const fs = require('fs');
const path = require('path');

async function init(
  basePath,
  { includeFiles = [], isMultiFolders = false, stagePath = 'dev' } = {}
) {
  assert(basePath, 'basePath is required');

  const app = express();
  const stage = express.Router();

  let handlersPaths = [path.join(basePath, 'index.js')];

  if (includeFiles && includeFiles.length) {
    handlersPaths = includeFiles;
  }

  const directoryBlacklist = ['node_modules', '.git', '.DS_Store'];
  const isAcceptedDirectory = directory => {
    return !directoryBlacklist.includes(directory);
  };

  if (isMultiFolders) {
    handlersPaths.push(
      ...fs
        .readdirSync(basePath, { withFileTypes: true })
        .filter(d => d.isDirectory() && isAcceptedDirectory(d.name))
        .map(d => path.join(basePath, `/${d.name}`, 'index.js'))
    );
  }

  const safe = middleware => (req, res, next) =>
    Promise.resolve(middleware(req, res, next)).catch(next);

  app.use(morgan('tiny'));
  app.use(express.json());
  app.use(`/${stagePath}`, stage);

  app.all('/', (req, res) => {
    res.redirect(`/${stagePath}`);
  });

  let successfulHandlers = 0;
  handlersPaths.forEach(handlerPath => {
    try {
      const { handler } = require(handlerPath);
      successfulHandlers++;

      const handlerName =
        path.dirname(handlerPath.replace(basePath, '')).replace(/^\//, '') || 'index.js';

      handler.expressCompatibility.forEach(route => {
        console.log(`[${handlerName}] ${route.method.toUpperCase()} ${route.path}`);

        stage[route.method](
          route.path,
          safe(async (req, res) => {
            const event = toLambda(req, route.resource);
            const context = getMockedContext();
            const response = await handler(event, context);

            res.status(response.statusCode);
            res.set(response.headers);
            res.send(response.body);
          })
        );
      });
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        console.log('> error:', err.message, '(skipping)');
        console.log(err.stack);
      }
    }
  });

  if (!successfulHandlers) {
    const pathsEvaluated = handlersPaths.map(p => `"${p}"`).join(', ');

    throw new Error(
      `No successful handlers found for offline server. Paths evaluated: ${pathsEvaluated}`
    );
  }

  const port = await getPort({
    port: getPort.makeRange(3000, 8080),
  });

  const url = `http://localhost:${port}/${stagePath}`;

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      console.log(`> server available at: ${url}\n`);

      function stop() {
        return new Promise((resolve, reject) => {
          server.close();

          let resolved = false;
          server.on('close', () => {
            if (resolved) {
              return;
            }

            resolved = true;
            resolve();
          });

          setTimeout(() => {
            if (resolved) {
              return;
            }

            resolved = true;
            reject(new Error('Timed out closing the server'));
          }, 5000);
        });
      }

      resolve({ server, stop, url });
    });
  });
}

module.exports.init = init;

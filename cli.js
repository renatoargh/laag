#!/usr/bin/env node

const laag = require('./index.js');
const { NODE_ENV: stagePath = 'dev', PWD: basePath } = process.env;

const isMultiFolders = process.argv.includes('--multi');
const includeFiles = process.argv
  .filter(flag => {
    return flag.startsWith('--include=');
  })
  .map(flag => {
    const fileName = flag.split('=')[1];
    return path.join(basePath, fileName);
  });

async function main() {
  const { server } = await laag.init(basePath, {
    includeFiles,
    stagePath,
    isMultiFolders,
  });

  process.on('SIGINT', function() {
    console.log('> closing server');

    server.close();

    server.on('close', () => {
      process.exit(0);
    });

    setTimeout(() => {
      console.log('> server close timeout, killing...');
      process.exit(1);
    }, 5000);
  });
}

main();

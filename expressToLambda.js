'use strict';

const uuid = require('uuid');

const capitalize = string => string[0].toUpperCase() + string.slice(1);

const isOdd = i => i % 2 !== 0;

const parseRawHeaders = rawHeaders =>
  rawHeaders.reduce((headers, value, index, array) => {
    if (isOdd(index)) {
      return headers;
    }

    headers[value] = array[index + 1];

    return headers;
  }, {});

const jwtRegex = /^Bearer [A-Za-z0-9-_=]+\.([A-Za-z0-9-_=]+)\.?[A-Za-z0-9-_.+/=]*$/;
const isJwt = auth => auth.match(jwtRegex);
const extractJwtPayload = auth => {
  let [, payload] = auth.match(jwtRegex);
  payload = Buffer.from(payload, 'base64').toString();
  return JSON.parse(payload);
};

module.exports = (req, resource) => {
  const auth = req.headers['Authorization'] || req.headers['authorization'];
  let authorizer = null;

  if (auth && isJwt(auth)) {
    authorizer = { claims: extractJwtPayload(auth) };
  }

  return {
    isBase64Encoded: false,
    httpMethod: req.method,
    headers: Object.assign(
      {
        'X-Forwarded-Proto': req.protocol,
      },
      parseRawHeaders(req.rawHeaders)
    ),
    resource: resource,
    pathParameters: req.params,
    queryStringParameters: req.query,
    body: JSON.stringify(req.body),
    requestContext: {
      stage: process.env.NODE_ENV,
      domainName: req.headers['host'],
      apiId: 'cfzx02oz87',
      requestId: uuid.v4().toString(),
      authorizer,
    },
  };
};

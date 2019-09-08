'use strict'

const capitalize = (string) => 
  string[0].toUpperCase() + string.slice(1)

const isOdd = (i) =>
  i % 2 !== 0

const parseRawHeaders = (rawHeaders) => 
  rawHeaders.reduce((headers, value, index, array) => {
    if (isOdd(index)) {
      return headers
    }

    headers[value] = array[index + 1]

    return headers
  }, {})

module.exports = (req, resource) => {
  return {
    isBase64Encoded: false,
    httpMethod: req.method,
    headers: Object.assign({
      'X-Forwarded-Proto': req.protocol,
    }, parseRawHeaders(req.rawHeaders)),
    resource: resource,
    pathParameters: req.params,
    queryStringParameters: req.query,
    body: JSON.stringify(req.body),
    requestContext: {
      stage: process.env.NODE_ENV,
      domainName: req.headers['host'],
      apiId: 'cfzx02oz87'
    }
  }
}

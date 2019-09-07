'use strict'

const capitalize = (string) => 
  string[0].toUpperCase() + string.slice(1)

const toUpperCaseKeys = (obj) => {
   return Object.entries(obj).reduce((newObject, [key, value]) => {
     const upperCaseKey = key.split('-').map(segment => {
       return capitalize(segment)
     }).join('-')
     
     newObject[upperCaseKey] = value
     return newObject
   }, {})
}

module.exports = (req) => {
  return {
    isBase64Encoded: false,
    httpMethod: req.method,
    headers: Object.assign({
      'X-Forwarded-Proto': req.protocol,
    }, toUpperCaseKeys(req.headers)),
    resource: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    requestContext: {
      stage: process.env.NODE_ENV
    }
  }
}

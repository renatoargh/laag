#!/usr/bin/env node

const express = require('express')
const toLambda = require('./expressToLambda')
const getMockedContext = require('./getMockedContext')
const app = express()
const stage = express.Router()
const {NODE_ENV: stagePath} = process.env

const path = require('path')
const pwd = process.env.PWD
const indexPath = path.join(pwd, 'index.js')
const {handler} = require(indexPath)

const port = process.argv[2] || 8080

const safe = (middleware) => 
  (req, res, next) => 
    Promise.resolve(middleware(req, res, next)).catch(next)

stage.all('*', safe(async (req, res) => {
  const event = toLambda(req)
  const context = getMockedContext()

  const response = await handler(event, context)

  res.status(response.statusCode)
  res.set(response.headers)
  res.send(response.body)
}))

app.use(`/${stagePath}`, stage)

app.listen(port, () => {
  console.log('try your lambda/api gateway integration at:')
  console.log(`> http://localhost:${port}/${stagePath}`)
})

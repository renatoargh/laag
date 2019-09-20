#!/usr/bin/env node

const express = require('express')
const morgan = require('morgan')
const getPort = require('get-port')
const toLambda = require('./expressToLambda')
const getMockedContext = require('./getMockedContext')
const app = express()
const stage = express.Router()
const {NODE_ENV: stagePath = 'dev'} = process.env

const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const pwd = process.env.PWD

const isMulti = process.argv.includes('--multi')

let handlersPaths = [path.join(pwd, 'index.js')]

if (isMulti) {
  handlersPaths = fs
    .readdirSync(pwd, {withFileTypes: true})
    .filter(d => d.isDirectory() && d.name !== 'node_modules')
    .map(d => path.join(pwd, `/${d.name}`, 'index.js'))
}

const safe = (middleware) => 
  (req, res, next) => Promise.resolve(middleware(req, res, next)).catch(next)

app.use(morgan('tiny'))
app.use(express.json())
app.use(`/${stagePath}`, stage)

app.all('/', (req, res) => {
  res.redirect(`/${stagePath}`)
})

console.log(`> ${pkg.name} - ${pkg.description}\n`)

handlersPaths.forEach(handlerPath => {
  console.log('>', path.dirname(handlerPath.replace(pwd, '')).replace(/^\//, ''))

  try {
    const {handler} = require(handlerPath)
    handler.expressCompatibility.forEach((route) => {
      console.log(`  ${route.method.toUpperCase()} ${route.path}`)

      stage[route.method](route.path, safe(async (req, res) => {
        const event = toLambda(req, route.resource)
        const context = getMockedContext()
        const response = await handler(event, context)

        res.status(response.statusCode)
        res.set(response.headers)
        res.send(response.body)
      }))
    })
  } catch (err) {
    console.log('> error:', err.message, '(skipping)')
  }

  console.log()
})

async function main() {
  const port = await getPort({
    port: getPort.makeRange(3000, 8080)
  })

  app.listen(port, () => {
    console.log(`> api available at:`)
    console.log(`  http://localhost:${port}/${stagePath}\n`)
  })
}

main()
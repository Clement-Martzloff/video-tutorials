/*
The application layer of the system uses [express](https://expressjs.com/) to
handle routing HTTP requests.  This file sets up the express application.
*/
const express = require('express')
const { join } = require('path')

const mountMiddleware = require('./mount-middlewares')
const mountRoutes = require('./mount-routes')

function createExpressApp({ config, env }) {
  const app = express()

  app.set('views', join(__dirname, '..'))
  app.set('view engine', 'pug')
  mountMiddleware(app, env)
  mountRoutes(app, config)

  return app
}

module.exports = createExpressApp

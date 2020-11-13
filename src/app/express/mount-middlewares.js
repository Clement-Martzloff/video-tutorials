const express = require('express')
const { join } = require('path')
const cookieSession = require('cookie-session')

const attachLocals = require('./attach-locals')
const lastResortErrorHandler = require('./last-resort-error-handler')
const primeRequestContext = require('./prime-request-context')

function mountMiddleware(app, env) {
  const cookieSessionMiddleware = cookieSession({ keys: [env.cookieSecret] })

  app.use(lastResortErrorHandler)
  app.use(cookieSessionMiddleware)
  app.use(primeRequestContext)
  app.use(attachLocals)
  app.use(express.static(join(__dirname, '..', 'public'), { maxAge: 86400000 }))
}

module.exports = mountMiddleware

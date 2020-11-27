const express = require('express')
const cors = require('cors')
const { join } = require('path')
const cookieSession = require('cookie-session')

const ensureOriginIsWhiteListed = require('./ensure-origin-is-white-listed')
const attachLocals = require('./attach-locals')
const lastResortErrorHandler = require('./last-resort-error-handler')
const primeRequestContext = require('./prime-request-context')

function mountMiddleware(app, env) {
  const cookieSessionMiddleware = cookieSession({ keys: [env.cookieSecret] })

  app.use(lastResortErrorHandler)
  app.use(cookieSessionMiddleware)
  app.use(cors(ensureOriginIsWhiteListed))
  app.use(primeRequestContext)
  app.use(attachLocals)
  app.use(express.static(join(__dirname, '..', 'public'), { maxAge: 86400000 }))
}

module.exports = mountMiddleware

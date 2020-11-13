const { v4 } = require('uuid')

function primeRequestContext(req, res, next) {
  req.context = { traceId: v4() }
  next()
}

module.exports = primeRequestContext

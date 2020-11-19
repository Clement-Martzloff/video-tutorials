const { v4 } = require('uuid')

function primeRequestContext(req, res, next) {
  req.context = {
    traceId: v4(),
    userId: req.session ? req.session.userId : null,
  }
  next()
}

module.exports = primeRequestContext

const allowlist = [
  'https://video-tutorials-message-db.herokuapp.com',
  'http://localhost:3000',
]

module.exports = function ensureOriginIsWhiteListed(req, callback) {
  const corsOptions = { origin: false }
  const origin = req.header('Origin')

  if (origin && allowlist.indexOf(origin) !== -1) {
    corsOptions.origin = true
  }

  callback(null, corsOptions)
}

const bcrypt = require('bcrypt')
// We could pull this out into an environment variable, but we don't
const SALT_ROUNDS = 10

function hashPassword(context) {
  return bcrypt
    .hash(context.attributes.password, SALT_ROUNDS)
    .then((passwordHash) => {
      context.passwordHash = passwordHash

      return context
    })
}

module.exports = hashPassword

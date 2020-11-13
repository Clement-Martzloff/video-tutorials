const bcrypt = require('bcrypt')
const CredentialMismatchError = require('../errors/credential-mismatch-error')

function validatePassword(context) {
  return bcrypt
    .compare(context.password, context.userCredential.passwordHash)
    .then((matched) => {
      if (!matched) {
        throw new CredentialMismatchError()
      }

      return context
    })
}

module.exports = validatePassword

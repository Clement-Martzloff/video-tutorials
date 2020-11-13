const { v4 } = require('uuid')
const AuthenticationError = require('../errors/authentication-error')

function handleCredentialMismatch(context) {
  const event = {
    id: v4(),
    type: 'UserLoginFailed',

    metadata: {
      traceId: context.traceId,
      userId: null,
    },
    data: {
      userId: context.userCredential.id,
      reason: 'Incorrect password',
    },
  }
  const streamName = `authentication-${context.userCredential.id}`

  return context.messageStore.write(streamName, event).then(() => {
    throw new AuthenticationError()
  })
}

module.exports = handleCredentialMismatch

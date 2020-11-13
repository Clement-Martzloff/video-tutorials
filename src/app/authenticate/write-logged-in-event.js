const { v4 } = require('uuid')

function writeLoggedInEvent(context) {
  const event = {
    id: v4(),
    type: 'UserLoggedIn',
    metadata: {
      traceId: context.traceId,
      userId: context.userCredential.id,
    },
    data: { userId: context.userCredential.id },
  }
  const streamName = `authentication-${context.userCredential.id}`

  return context.messageStore.write(streamName, event).then(() => context)
}

module.exports = writeLoggedInEvent

const { v4 } = require('uuid')

function writeRegisteredEvent(context, err) {
  const command = context.command
  const registeredEvent = {
    id: v4(),
    type: 'Registered',
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId,
    },
    data: {
      userId: command.data.userId,
      email: command.data.email,
      passwordHash: command.data.passwordHash,
    },
  }
  const identityStreamName = `identity-${command.data.userId}`

  return context.messageStore
    .write(identityStreamName, registeredEvent)
    .then(() => context)
}

module.exports = writeRegisteredEvent

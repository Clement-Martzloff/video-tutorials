const { v4 } = require('uuid')

function writeRegistrationEmailSentEvent(context, err) {
  const event = context.event
  const registrationEmailSentEvent = {
    id: v4(),
    type: 'RegistrationEmailSent',
    metadata: {
      traceId: event.metadata.traceId,
      userId: event.metadata.userId,
    },
    data: {
      userId: context.identityId,
      emailId: event.data.emailId,
    },
  }

  const identityStreamName = event.metadata.originStreamName

  return context.messageStore
    .write(identityStreamName, registrationEmailSentEvent)
    .then(() => context)
}

module.exports = writeRegistrationEmailSentEvent

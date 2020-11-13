const { v4 } = require('uuid')
const { v5 } = require('uuid')

const uuidv5Namespace = '0c46e0b7-dfaf-443a-b150-053b67905cc2'

function writeSendCommand(context, err) {
  const event = context.event
  const identity = context.identity
  const email = context.email
  const emailId = v5(identity.email, uuidv5Namespace)
  const sendEmailCommand = {
    id: v4(),
    type: 'Send',
    metadata: {
      originStreamName: `identity-${identity.id}`,
      traceId: event.metadata.traceId,
      userId: event.metadata.userId,
    },
    data: {
      emailId,
      to: identity.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    },
  }
  const streamName = `sendEmail:command-${emailId}`

  return context.messageStore
    .write(streamName, sendEmailCommand)
    .then(() => context)
}

module.exports = writeSendCommand

const { v4 } = require('uuid')

function writeSentEvent(context) {
  const sendCommand = context.sendCommand
  const streamName = `sendEmail-${sendCommand.data.emailId}`
  const event = {
    id: v4(),
    type: 'Sent',
    metadata: {
      originStreamName: sendCommand.metadata.originStreamName,
      traceId: sendCommand.metadata.traceId,
      userId: sendCommand.metadata.userId,
    },
    data: sendCommand.data,
  }

  return context.messageStore.write(streamName, event).then(() => context)
}

module.exports = writeSentEvent

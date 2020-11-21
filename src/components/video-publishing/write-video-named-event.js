const { v4 } = require('uuid')

module.exports = function writeVideoNamedEvent(context) {
  const command = context.command
  const messageStore = context.messageStore
  const videoNamedEvent = {
    id: v4(),
    type: 'VideoNamed',
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId,
    },
    data: { name: command.data.name },
  }
  const streamName = `videoPublishing-${command.data.videoId}`

  return messageStore.write(streamName, videoNamedEvent).then(() => context)
}

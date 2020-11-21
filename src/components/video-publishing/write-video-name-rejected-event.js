const { v4 } = require('uuid')

module.exports = function writeVideoNameRejectedEvent(context, reason) {
  const command = context.command
  const messageStore = context.messageStore
  const VideoNameRejectedEvent = {
    id: v4(),
    type: 'VideoNameRejected',
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId,
    },
    data: {
      name: command.data.name,
      reason: reason,
    },
  }
  const streamName = `videoPublishing-${command.data.videoId}`

  return messageStore
    .write(streamName, VideoNameRejectedEvent)
    .then(() => context)
}

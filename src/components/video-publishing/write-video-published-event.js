function writeVideoPublishedEvent(context) {
  const command = context.command
  const messageStore = context.messageStore

  const event = {
    id: uuid(),
    type: 'VideoPublished',
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId,
    },
    data: {
      ownerId: command.data.ownerId,
      sourceUri: command.data.sourceUri,
      transcodedUri: context.transcodedUri,
      videoId: command.data.videoId,
    },
  }
  const streamName = `videoPublishing-${command.data.videoId}`

  return messageStore.write(streamName, event).then(() => context)
}

module.exports = writeVideoPublishedEvent

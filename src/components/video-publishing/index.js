const Bluebird = require('bluebird')

const AlreadyPublishedError = require('./already-published-error')
const ensurePublishingNotAttempted = require('./ensure-publishing-not-attempted')
const loadVideo = require('./load-video')
const transcodeVideo = require('./transcode-video')
const writeVideoPublishedEvent = require('./write-video-published-event')
const writeVideoPublishingFailedEvent = require('./write-video-publishing-failed-event')

module.exports = function build({ messageStore }) {
  const handlers = createHandlers({ messageStore })
  const subscription = messageStore.createSubscription({
    streamName: 'videoPublishing:command',
    handlers: handlers,
    subscriberId: `video-publishing`,
  })

  function start() {
    subscription.start()
  }

  return {
    handlers,
    start,
  }
}

function createHandlers({ messageStore }) {
  return {
    PublishVideo: (command) => {
      const context = {
        command: command,
        messageStore: messageStore,
      }

      return Bluebird.resolve(context)
        .then(loadVideo)
        .then(ensurePublishingNotAttempted)
        .then(transcodeVideo)
        .then(writeVideoPublishedEvent)
        .catch(AlreadyPublishedError, () => {})
        .catch((err) => writeVideoPublishingFailedEvent(err, context))
    },
  }
}

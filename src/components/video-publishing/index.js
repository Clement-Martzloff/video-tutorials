const Bluebird = require('bluebird')

const AlreadyPublishedError = require('./already-published-error')
const ensurePublishingNotAttempted = require('./ensure-publishing-not-attempted')
const loadVideo = require('./load-video')
const transcodeVideo = require('./transcode-video')
const writeVideoPublishedEvent = require('./write-video-published-event')
const writeVideoPublishingFailedEvent = require('./write-video-publishing-failed-event')

const ensureCommandHasNotBeenProcessed = require('./ensure-command-has-not-been-processed')
const ensureNameIsValid = require('./ensure-name-is-valid')
const writeVideoNamedEvent = require('./write-video-named-event')
const writeVideoNameRejectedEvent = require('./write-video-name-rejected-event')
const CommandAlreadyProcessedError = require('./command-already-processed-error')
const ValidationError = require('./validation-error')

module.exports = function build({ messageStore }) {
  const handlers = createHandlers({ messageStore })
  const subscription = messageStore.createSubscription({
    streamName: 'videoPublishing:command',
    handlers: handlers,
    subscriberId: `videoPublishing`,
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
    NameVideo: (command) => {
      const context = {
        command: command,
        messageStore: messageStore,
      }

      return Bluebird.resolve(context)
        .then(loadVideo)
        .then(ensureCommandHasNotBeenProcessed)
        .then(ensureNameIsValid)
        .then(writeVideoNamedEvent)
        .catch(CommandAlreadyProcessedError, () => {})
        .catch(ValidationError, (err) =>
          writeVideoNameRejectedEvent(context, err.message),
        )
    },
  }
}

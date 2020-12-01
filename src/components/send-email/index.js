const Bluebird = require('bluebird')

const AlreadySentError = require('./already-sent-error')
const ensureEmailHasNotBeenSent = require('./ensure-email-has-not-been-sent')
const loadEmail = require('./load-email')
const createSend = require('./send')
const SendError = require('./send-error')
const sendEmail = require('./send-email')
const writeFailedEvent = require('./write-failed-event')
const writeSentEvent = require('./write-sent-event')

function build({ messageStore, systemSenderEmailAddress, transport }) {
  const justSendIt = createSend({ transport })

  const handlers = createHandlers({
    messageStore,
    justSendIt,
    systemSenderEmailAddress,
  })

  const subscription = messageStore.createSubscription({
    streamName: 'sendEmail:command',
    handlers,
    subscriberId: 'sendEmail',
  })

  return {
    start,
    handlers,
  }

  function start() {
    subscription.start()
  }

  function createHandlers({
    justSendIt,
    messageStore,
    systemSenderEmailAddress,
  }) {
    return {
      Send: (command) => {
        const context = {
          messageStore,
          justSendIt,
          systemSenderEmailAddress,
          sendCommand: command,
        }

        return (
          Bluebird.resolve(context)
            .then(loadEmail)
            .then(ensureEmailHasNotBeenSent)
            .then(sendEmail)
            .then(writeSentEvent)
            // If it's already sent, then we do a no-op
            .catch(AlreadySentError, () => {})
            .catch(SendError, (err) => writeFailedEvent(context, err))
        )
      },
    }
  }
}

module.exports = build

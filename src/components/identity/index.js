const Bluebird = require('bluebird')
const loadIdentity = require('./load-identity')
const ensureNotRegistered = require('./ensure-not-registered')
const writeRegisteredEvent = require('./write-registered-event')
const AlreadyRegisteredError = require('./already-registered-error')

const ensureRegistrationEmailNotSent = require('./ensure-registration-email-not-sent')
const renderRegistrationEmail = require('./render-registration-email')
const writeSendEmailCommand = require('./write-send-email-command')
const writeRegistrationEmailSentEvent = require('./write-registration-email-sent-event')
const AlreadySentRegistrationEmailError = require('./already-sent-registration-email-error')

module.exports = function build({ messageStore }) {
  const identityCommandHandlers = createIdentityCommandHandlers({
    messageStore,
  })
  const identityCommandSubscription = messageStore.createSubscription({
    streamName: 'identity:command',
    handlers: identityCommandHandlers,
    subscriberId: 'identity:command',
  })
  const identityEventHandlers = createIdentityEventHandlers({
    messageStore,
  })
  const identityEventSubscription = messageStore.createSubscription({
    streamName: 'identity',
    handlers: identityEventHandlers,
    subscriberId: 'identity',
  })
  const sendEmailEventHandlers = createSendEmailEventHandlers({ messageStore })
  const sendEmailEventSubscription = messageStore.createSubscription({
    streamName: 'sendEmail',
    handlers: sendEmailEventHandlers,
    originStreamName: 'identity',
    subscriberId: 'identitySendEmail',
  })

  function start() {
    identityCommandSubscription.start()
    identityEventSubscription.start()
    sendEmailEventSubscription.start()
  }

  return {
    start,
    identityCommandHandlers,
    identityEventHandlers,
    sendEmailEventHandlers,
  }
}

function createIdentityCommandHandlers({ messageStore }) {
  return {
    Register: (command) => {
      const context = {
        messageStore,
        command,
        identityId: command.data.userId,
      }

      return Bluebird.resolve(context)
        .then(loadIdentity)
        .then(ensureNotRegistered)
        .then(writeRegisteredEvent)
        .catch(AlreadyRegisteredError, (err) => {})
    },
  }
}

function createIdentityEventHandlers({ messageStore }) {
  return {
    Registered: (event) => {
      const context = {
        messageStore: messageStore,
        event,
        identityId: event.data.userId,
      }

      return Bluebird.resolve(context)
        .then(loadIdentity)
        .then(ensureRegistrationEmailNotSent)
        .then(renderRegistrationEmail)
        .then(writeSendEmailCommand)
        .catch(AlreadySentRegistrationEmailError, () => {})
    },
  }
}

function createSendEmailEventHandlers({ messageStore }) {
  return {
    Sent: (event) => {
      const originStreamName = event.metadata.originStreamName
      const identityId = streamNameToId(originStreamName)
      const context = {
        messageStore,
        event,
        identityId,
      }

      return Bluebird.resolve(context)
        .then(loadIdentity)
        .then(ensureRegistrationEmailNotSent)
        .then(writeRegistrationEmailSentEvent)
        .catch(AlreadySentRegistrationEmailError, () => {})
    },
  }
}

function streamNameToId(streamName) {
  return streamName.split(/-(.+)/)[1]
}

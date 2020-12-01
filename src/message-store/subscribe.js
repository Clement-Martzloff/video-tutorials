const Bluebird = require('bluebird')
const { v4 } = require('uuid')

const category = require('./category')

function configureCreateSubscription({ read, readLastMessage, write }) {
  return ({
    streamName,
    handlers,
    messagesPerTick = 100,
    subscriberId,
    positionUpdateInterval = 100,
    originStreamName = null,
    tickIntervalMs = 100,
  }) => {
    const subscriberStreamName = `${subscriberId}+position`

    let currentPosition = 0
    let currentGlobalPosition = 0
    let messagesSinceLastPositionWrite = 0
    let keepGoing = true

    function loadPositions() {
      return readLastMessage(subscriberStreamName).then((message) => {
        currentPosition = message ? message.data.position : 0
        currentGlobalPosition = message ? message.data.globalPosition : 0
      })
    }

    function updatePositions(position, globalPosition) {
      currentPosition = position
      currentGlobalPosition = globalPosition
      messagesSinceLastPositionWrite += 1

      if (messagesSinceLastPositionWrite === positionUpdateInterval) {
        messagesSinceLastPositionWrite = 0

        return writePositionsEvent(position, globalPosition)
      }

      return Bluebird.resolve(true)
    }

    function writePositionsEvent(position, globalPosition) {
      const positionsEvent = {
        id: v4(),
        type: 'Read',
        data: { position, globalPosition },
      }

      return write(subscriberStreamName, positionsEvent)
    }

    function getNextBatchOfMessages() {
      return read(
        streamName,
        currentPosition + 1,
        currentGlobalPosition + 1,
        messagesPerTick,
      ).then(filterOnOriginMatch)
    }

    function filterOnOriginMatch(messages) {
      if (!originStreamName) {
        return messages
      }

      return messages.filter((message) => {
        const originCategory =
          message.metadata && category(message.metadata.originStreamName)

        return originStreamName === originCategory
      })
    }

    function processBatch(messages) {
      return Bluebird.each(messages, (message) =>
        handleMessage(message)
          .then(() => updatePositions(message.position, message.globalPosition))
          .catch((err) => {
            logError(message, err)

            // Re-throw so that we can break the chain
            throw err
          }),
      ).then(() => messages.length)
    }

    function logError(lastMessage, error) {
      // eslint-disable-next-line no-console
      console.error(
        'error processing:\n',
        `\t${subscriberId}\n`,
        `\t${lastMessage.id}\n`,
        `\t${error}\n`,
      )
    }

    function handleMessage(message) {
      const handler = handlers[message.type] || handlers.$any

      return handler ? handler(message) : Promise.resolve(true)
    }

    function tick() {
      return getNextBatchOfMessages()
        .then(processBatch)
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Error processing batch', err)

          stop()
        })
    }

    async function poll() {
      await loadPositions()

      // eslint-disable-next-line no-unmodified-loop-condition
      while (keepGoing) {
        const messagesProcessed = await tick()

        if (messagesProcessed === 0) {
          await Bluebird.delay(tickIntervalMs)
        }
      }
    }

    function start() {
      // eslint-disable-next-line
      console.log(`Started ${subscriberId}`)

      return poll()
    }

    function stop() {
      // eslint-disable-next-line
      console.log(`Stopped ${subscriberId}`)

      keepGoing = false
    }

    return {
      loadPositions,
      start,
      stop,
      tick,
      writePositionsEvent,
    }
  }
}

module.exports = configureCreateSubscription

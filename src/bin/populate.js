const Bluebird = require('bluebird')

const events = require('../../example-messages/commands.json')
const createConfig = require('../config')
const env = require('../env')

const config = createConfig({ env })

Bluebird.each(events, (event) =>
  config.messageStore.write(event.streamName, event.event),
)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Populated with test data.  The game is afoot!')
  })
  .finally(() =>
    config.db.then((client) => client.destroy()).then(config.messageStore.stop),
  )

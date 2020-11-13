const createWrite = require('./write')
const createRead = require('./read')
const configureCreateSubscription = require('./subscribe')

function createMessageStore({ db }) {
  const write = createWrite({ db })
  const read = createRead({ db })
  const createSubscription = configureCreateSubscription({
    read: read.read,
    readLastMessage: read.readLastMessage,
    fetch: read.fetch,
    write,
  })

  return {
    createSubscription,
    read: read.read,
    readLastMessage: read.readLastMessage,
    fetch: read.fetch,
    write,
  }
}

module.exports = createMessageStore

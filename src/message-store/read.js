const deserializeMessage = require('./deserialize-message')

const getStreamMessagesSql = 'SELECT * FROM get_stream_messages($1, $2, $3)'
const getCategoryMessagesSql = 'SELECT * FROM get_category_messages($1, $2, $3)'
const getLastMessageSql = 'SELECT * FROM get_last_stream_message($1)'
const getAllMessagesSql = `
  SELECT
    id::varchar,
    stream_name::varchar,
    type::varchar,
    position::bigint,
    global_position::bigint,
    data::varchar,
    metadata::varchar,
    time::timestamp
  FROM
    messages
  WHERE
    global_position > $1
  LIMIT $2
`

function createRead({ db }) {
  function read(
    streamName,
    fromPosition = 0,
    fromGlobalPosition = 1,
    maxMessages = 1000,
  ) {
    let query = null
    let values = []

    if (streamName === '$all') {
      query = getAllMessagesSql
      values = [fromGlobalPosition, maxMessages]
    } else if (streamName.includes('-')) {
      // Entity streams have a dash
      query = getStreamMessagesSql
      values = [streamName, fromPosition, maxMessages]
    } else {
      // Category streams do not have a dash
      query = getCategoryMessagesSql
      values = [streamName, fromGlobalPosition, maxMessages]
    }

    return db
      .query(query, values)
      .then((res) => res.rows.map(deserializeMessage))
  }

  function readLastMessage(streamName) {
    return db
      .query(getLastMessageSql, [streamName])
      .then((res) => deserializeMessage(res.rows[0]))
  }

  function fetch(streamName, projection) {
    return read(streamName).then((messages) => project(messages, projection))
  }

  return { read, readLastMessage, fetch }
}

function project(events, projection) {
  return events.reduce((entity, event) => {
    if (!projection[event.type]) {
      return entity
    }

    return projection[event.type](entity, event)
  }, projection.$init())
}

module.exports = createRead

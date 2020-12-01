module.exports = function isEntityStream(streamName) {
  // Entity streams have a dash
  return streamName.includes('-')
}

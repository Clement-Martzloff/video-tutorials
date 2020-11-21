const CommandAlreadyProcessedError = require('./command-already-processed-error')

module.exports = function ensureCommandHasNotBeenProcessed(context) {
  const command = context.command
  const video = context.video

  if (video.sequence > command.globalPosition) {
    throw new CommandAlreadyProcessedError()
  }

  return context
}

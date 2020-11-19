const FAKE_TRANSCODING_DESTINATION =
  'https://www.youtube.com/watch?v=GI_P3UtZXAA'

function transcodeVideo(context) {
  console.log('We totally have a video transcoder installed that we are')
  console.log('totally calling in this function. If we did not have such')
  console.log('an awesome one installed locally, we could call into a')
  console.log('3rd-party API here instead.')

  const { video } = context
  context.transcodedUri = FAKE_TRANSCODING_DESTINATION
  console.log(`Transcode ${video.sourceUri} to ${context.transcodedUri}`)

  return context
}

module.exports = transcodeVideo

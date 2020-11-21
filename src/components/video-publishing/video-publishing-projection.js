module.exports = {
  $init() {
    return {
      id: null,
      publishingAttempted: false,
      sourceUri: null,
      transcodedUri: null,
      sequence: 0,
      name: '',
    }
  },
  VideoPublished(video, videoPublished) {
    video.id = videoPublished.data.videoId
    video.publishingAttempted = true
    video.ownerId = videoPublished.data.ownerId
    video.sourceUri = videoPublished.data.sourceUri
    video.transcodedUri = videoPublished.data.transcodedUri

    return video
  },
  VideoPublishingFailed(video, videoPublishingFailed) {
    video.id = videoPublishingFailed.data.videoId
    video.publishingAttempted = true
    video.ownerId = videoPublishingFailed.data.ownerId
    video.sourceUri = videoPublishingFailed.data.sourceUri

    return video
  },
  VideoNamed(video, videoNamed) {
    video.sequence = videoNamed.globalPosition
    video.name = videoNamed.data.name

    return video
  },
  VideoNameRejected(video, videoNameRejected) {
    video.sequence = videoNameRejected.globalPosition

    return video
  },
}

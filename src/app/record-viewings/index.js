const express = require('express')
const { v4 } = require('uuid')

function createRecordWiewIngs({ messageStore }) {
  const actions = createActions({ messageStore })
  const handlers = createHandlers({ actions })
  const router = express.Router()

  router.route('/:videoId').post(handlers.handleRecordViewing)

  return { actions, handlers, router }
}

function createActions({ messageStore }) {
  function recordViewing(traceId, videoId, userId) {
    const viewedEvent = {
      id: v4(),
      type: 'VideoViewed',
      metadata: {
        traceId,
        videoId,
      },
      data: {
        userId,
        videoId,
      },
    }
    const streamName = `viewing-${videoId}`

    return messageStore.write(streamName, viewedEvent)
  }

  return { recordViewing }
}

function createHandlers({ actions }) {
  function handleRecordViewing(req, res) {
    return actions
      .recordViewing(req.context.traceId, req.params.videoId)
      .then(() => res.redirect('/'))
  }

  return { handleRecordViewing }
}

module.exports = createRecordWiewIngs

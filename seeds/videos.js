const { v4 } = require('v4')

const seedVideos = [
  {
    owner_id: v4(),
    name: `video ${v4()}`,
    description: 'Best video ever',
    transcoding_status: 'transcoded',
    view_count: 0,
  },
  {
    owner_id: v4(),
    name: `video ${v4()}`,
    description: 'Even more best video',
    transcoding_status: 'transcoded',
    view_count: 1,
  },
  {
    owner_id: v4(),
    name: `video ${v4()}`,
    description: 'Even still more best video',
    transcoding_status: 'transcoded',
    view_count: 2,
  },
]

exports.seed = (knex) =>
  knex('videos')
    .del()
    .then(() => knex('videos').insert(seedVideos))

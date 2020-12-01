const createPickupTransport = require('nodemailer-pickup-transport')

const createKnexClient = require('./knex-client')
const createPostgresClient = require('./postgres-client')

const createMessageStore = require('./message-store')

const createHomePageAggregator = require('./aggregators/home-page')
const createUserCredentialsAggregator = require('./aggregators/user-credentials')
const createVideoOperationsAggregator = require('./aggregators/video-operations')
const createCreatorsVideosAggregator = require('./aggregators/creators-videos')
const createAdminUsersAggregator = require('./aggregators/admin-users')
const createAdminStreamAggregator = require('./aggregators/admin-streams')
const createAdminSubscriberPositionsAggregator = require('./aggregators/admin-subscriber-positions')

const createHomeApp = require('./app/home')
const createRecordViewingsApp = require('./app/record-viewings')
const createRegisterUsersApp = require('./app/register-users')
const createAuthenticateApp = require('./app/authenticate')
const createCreatorsPortalApp = require('./app/creators-portal')
const createAdminApp = require('./app/admin')

const createIdentityComponent = require('./components/identity')
const createSendEmailComponent = require('./components/send-email')
const createVideoPublishingComponent = require('./components/video-publishing')

module.exports = function ({ env }) {
  const knexClient = createKnexClient({ connectionString: env.databaseUrl })
  const postgresClient = createPostgresClient({
    connectionString: env.messageStoreConnectionString,
  })

  const messageStore = createMessageStore({ db: postgresClient })

  const homeApp = createHomeApp({ db: knexClient })
  const recordViewingsApp = createRecordViewingsApp({ messageStore })
  const registerUsersApp = createRegisterUsersApp({
    db: knexClient,
    messageStore,
  })
  const authenticateApp = createAuthenticateApp({
    db: knexClient,
    messageStore,
  })
  const creatorsPortalApp = createCreatorsPortalApp({
    db: knexClient,
    messageStore,
  })
  const adminApp = createAdminApp({
    db: knexClient,
    messageStoreDb: postgresClient,
  })

  const homePageAggregator = createHomePageAggregator({
    db: knexClient,
    messageStore,
  })
  const userCredentialsAggregator = createUserCredentialsAggregator({
    db: knexClient,
    messageStore,
  })
  const videoOperationsAggregator = createVideoOperationsAggregator({
    db: knexClient,
    messageStore,
  })
  const creatorsVideosAggregator = createCreatorsVideosAggregator({
    db: knexClient,
    messageStore,
  })
  const adminUsersAggregator = createAdminUsersAggregator({
    db: knexClient,
    messageStore,
  })
  const adminStreamsAggregator = createAdminStreamAggregator({
    db: knexClient,
    messageStore,
  })
  const adminSubscriberPositionsAggregator = createAdminSubscriberPositionsAggregator(
    { db: knexClient, messageStore },
  )

  const identityComponent = createIdentityComponent({ messageStore })
  const sendEmailComponent = createSendEmailComponent({
    messageStore,
    systemSenderEmailAddress: env.systemSenderEmailAddress,
    transport: createPickupTransport({ directory: env.emailDirectory }),
  })
  const videoPublishingComponent = createVideoPublishingComponent({
    messageStore,
  })

  const aggregators = [
    homePageAggregator,
    userCredentialsAggregator,
    videoOperationsAggregator,
    creatorsVideosAggregator,
    adminUsersAggregator,
    adminStreamsAggregator,
    adminSubscriberPositionsAggregator,
  ]

  const components = [
    identityComponent,
    sendEmailComponent,
    videoPublishingComponent,
  ]

  return {
    env,
    db: knexClient,
    homeApp,
    recordViewingsApp,
    registerUsersApp,
    authenticateApp,
    creatorsPortalApp,
    adminApp,
    messageStore,
    aggregators,
    components,
  }
}

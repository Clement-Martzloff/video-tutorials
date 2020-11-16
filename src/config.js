const createPickupTransport = require('nodemailer-pickup-transport')

const createKnexClient = require('./knex-client')
const createPostgresClient = require('./postgres-client')

const createMessageStore = require('./message-store')

const createHomePageAggregator = require('./aggregators/home-page')
const createUserCredentials = require('./aggregators/user-credentials')

const createHomeApp = require('./app/home')
const createRecordViewingsApp = require('./app/record-viewings')
const createRegisterUsersApp = require('./app/register-users')
const createAuthenticateApp = require('./app/authenticate')
const createCreatorsPortalApp = require('./app/creators-portal')

const createIdentityComponent = require('./components/identity')
const createSendEmailComponent = require('./components/send-email')

function createConfig({ env }) {
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

  const homePageAggregator = createHomePageAggregator({
    db: knexClient,
    messageStore,
  })
  const userCredentialsAggregator = createUserCredentials({
    db: knexClient,
    messageStore,
  })

  const identityComponent = createIdentityComponent({ messageStore })
  const sendEmailComponent = createSendEmailComponent({
    messageStore,
    systemSenderEmailAddress: env.systemSenderEmailAddress,
    transport: createPickupTransport({ directory: env.emailDirectory }),
  })

  const aggregators = [homePageAggregator, userCredentialsAggregator]
  const components = [identityComponent, sendEmailComponent]

  return {
    env,
    db: knexClient,
    homeApp,
    recordViewingsApp,
    registerUsersApp,
    authenticateApp,
    creatorsPortalApp,
    messageStore,
    aggregators,
    components,
  }
}

module.exports = createConfig

const createExpressApp = require('./app/express')
const createConfig = require('./config')
const env = require('./env')

const config = createConfig({ env })
const app = createExpressApp({ config, env })

function start() {
  config.aggregators.forEach((a) => a.start())
  config.components.forEach((c) => c.start())
  app.listen(env.port, signalAppStart)
}

function signalAppStart() {
  console.log(`${env.appName} started`)
  console.table([
    ['Port', env.port],
    ['Environment', env.env],
  ])
}

exports.app = app
exports.config = config
exports.start = start

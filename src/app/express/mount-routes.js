/**
 * @description Mounts application routes into the Express application
 * @param {object} app Express app on which to mount the routes
 * @param {object} config A config object will all the parts of the system
 */
function mountRoutes(app, config) {
  app.use('/', config.homeApp.router)
  app.use('/record-viewing', config.recordViewingsApp.router)
  app.use('/register', config.registerUsersApp.router)
  app.use('/auth', config.authenticateApp.router)
}

module.exports = mountRoutes

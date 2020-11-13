const Bluebird = require('bluebird')
const bodyParser = require('body-parser')
const camelCaseKeys = require('camelcase-keys')
const express = require('express')
const { v4 } = require('uuid')
const ValidationError = require('../errors/validation-error')

const validate = require('./validate')
const loadExistingIdentity = require('./load-existing-identity')
const ensureThereWasNoExistingIdentity = require('./ensure-there-was-no-existing-identity')
const hashPassword = require('./hash-password')
const writeRegisterCommand = require('./write-register-command')

function createRegisterUsers({ db, messageStore }) {
  const queries = createQueries({ db })
  const actions = createActions({ messageStore, queries })
  const handlers = createHandlers({ actions })
  const router = express.Router()

  router
    .route('/')
    .get(handlers.handleRegistrationForm)
    .post(
      bodyParser.urlencoded({ extended: false }),
      handlers.handleRegisterUser,
    )

  router
    .route('/registration-complete')
    .get(handlers.handleRegistrationComplete)

  return { actions, handlers, queries, router }
}

function createQueries({ db }) {
  function byEmail(email) {
    return db
      .then((client) => client('user_credentials').where({ email }).limit(1))
      .then(camelCaseKeys)
      .then((rows) => rows[0])
  }

  return { byEmail }
}

function createActions({ messageStore, queries }) {
  function registerUser(traceId, attributes) {
    const context = { attributes, traceId, messageStore, queries }

    return Bluebird.resolve(context)
      .then(validate)
      .then(loadExistingIdentity)
      .then(ensureThereWasNoExistingIdentity)
      .then(hashPassword)
      .then(writeRegisterCommand)
  }

  return {
    registerUser,
  }
}

function createHandlers({ actions }) {
  function handleRegistrationForm(req, res) {
    const userId = v4()

    res.render('register-users/templates/register', { userId })
  }

  function handleRegistrationComplete(req, res) {
    res.render('register-users/templates/registration-complete')
  }

  function handleRegisterUser(req, res, next) {
    const attributes = {
      id: req.body.id,
      email: req.body.email,
      password: req.body.password,
    }

    return actions
      .registerUser(req.context.traceId, attributes)
      .then(() => res.redirect(301, 'register/registration-complete'))
      .catch(ValidationError, (err) =>
        res.status(400).render('register-users/templates/register', {
          userId: attributes.id,
          errors: err.errors,
        }),
      )
      .catch(next)
  }

  return {
    handleRegistrationForm,
    handleRegistrationComplete,
    handleRegisterUser,
  }
}

module.exports = createRegisterUsers

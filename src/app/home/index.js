const camelCaseKeys = require('camelcase-keys')
const express = require('express')

function createHome({ db }) {
  const queries = createQueries({ db })
  const handlers = createHandlers({ queries })
  const router = express.Router()

  router.route('/').get(handlers.home)

  return { queries, handlers, router }
}

function createQueries({ db }) {
  function loadHomePage() {
    return db.then((client) =>
      client('pages')
        .where({ page_name: 'home' })
        .limit(1)
        .then(camelCaseKeys)
        .then((rows) => rows[0]),
    )
  }

  return {
    loadHomePage,
  }
}

function createHandlers({ queries }) {
  function home(req, res, next) {
    return queries
      .loadHomePage()
      .then((homePageData) =>
        res.render('home/templates/home', homePageData.pageData),
      )
      .catch(next)
  }

  return { home }
}

module.exports = createHome

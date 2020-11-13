const Email = require('email-templates')
const { join } = require('path')

const templateRoot = join(__dirname, 'templates')

/**
 * @description Renders the registration email for an identity and attaches it
 * to context.email
 * @param {object} context
 * @param {object} context.identity The identity we're rendering this for
 * @return {Promise} A Promise resolving to the context
 */
function renderEmail(context) {
  const email = new Email({ views: { root: templateRoot } })

  return email.renderAll('registration-email', {}).then((rendered) => {
    context.email = rendered

    return context
  })
}

module.exports = renderEmail

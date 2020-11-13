const nodemailer = require('nodemailer')

const SendError = require('./send-error')

function createSend({ transport }) {
  const sender = nodemailer.createTransport(transport)

  return function send(email) {
    const potentialError = new SendError()

    return sender.sendMail(email).catch((err) => {
      potentialError.message = err.message

      throw potentialError
    })
  }
}

module.exports = createSend

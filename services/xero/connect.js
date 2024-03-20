const client = require('./client')

module.exports = async (request, response) => {
  if (!request.session.origin) {
    request.session.origin = request.originalUrl
  }
  const url = await client.buildConsentUrl()
  response.redirect(url)
}

const client = require('./client')

module.exports = async (request, response) => {
  try {
    const tokenSet = await client.apiCallback(request.url)
    await client.updateTenants()
    request.session.tokenSet = tokenSet
    response.redirect(request.session.origin)
  } catch (error) {
    response.status(404)
      .send('404 Page Not Found')
  }
}

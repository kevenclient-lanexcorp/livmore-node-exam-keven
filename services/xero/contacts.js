const queue = require('./queue')

module.exports = async (request, response) => {
  const { session, originalUrl, query } = request
  if (!session.tokenSet) {
    request.session.origin = originalUrl
    response.redirect('/xero/connect')
    return
  }
  const job = await queue.add({
    name: '/contacts', query, session,
  })
  const result = await job.finished()
  response.json(result)
}

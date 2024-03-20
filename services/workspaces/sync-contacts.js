const pg = require('./../../postgresql')
const queue = require('./../xero/queue')

module.exports = async (request, response) => {
  const { params, query, session, originalUrl } = request
  const { workspaceId } = params

  if (!session.tokenSet) {
    request.session.origin = originalUrl
    response.redirect('/xero/connect')
    return
  }

  const job = await queue.add({
    name: '/contacts', query, session,
  })

  const result = await job.finished()

  for (const details of result) {
    const sql = 'insert into contacts (workspace_id, xero_contact_id) values ($1, $2)'
    await pg.query(sql, [workspaceId, details.ContactID])
  }

  response.send('Sync successful!')
}

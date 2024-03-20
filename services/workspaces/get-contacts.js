const pg = require('./../../postgresql')
const queue = require('./../xero/queue')
const lodash = require('lodash')

module.exports = async (request, response) => {
  const { params, session, originalUrl } = request
  const { workspaceId } = params

  if (!session.tokenSet) {
    request.session.origin = originalUrl
    response.redirect('/xero/connect')
    return
  }

  const sql = lodash.join([
    'select *, null as xero_contact_details',
    'from contacts',
    'where workspace_id = $1',
  ], ' ')

  const { rows } = await pg.query(sql, [workspaceId])

  if (lodash.isEmpty(rows)) {
    response.json([])
    return
  }

  const contacts = lodash.keyBy(rows, 'xero_contact_id')
  const Ids = lodash.keys(contacts)
  const query = { Ids: lodash.join(Ids) }

  const job = await queue.add({
    name: '/contacts', query, session,
  })

  const result = await job.finished()

  for (const details of result) {
    const path = [details.ContactID, 'xero_contact_details']
    lodash.set(contacts, path, details)
  }

  const values = lodash.values(contacts)
  response.json(values)
}

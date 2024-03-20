const lodash = require('lodash')

const contacts = async (client, query) => {
  const [{ tenantId }] = client.tenants
  const segments = lodash.split(query.Ids, ',')
  const iDs = lodash.uniq(segments)
  const { response } = await client.accountingApi
    .getContacts(tenantId, null, null, null, iDs)
  return response.data.Contacts
}

module.exports = contacts

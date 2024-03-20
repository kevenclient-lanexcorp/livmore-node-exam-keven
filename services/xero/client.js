const { XeroClient } = require('xero-node')

module.exports = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID,
  clientSecret: process.env.XERO_CLIENT_SECRET,
  redirectUris: [process.env.XERO_REDIRECT_URI],
  scopes: ['openid', 'profile', 'email', 'accounting.contacts.read'],
})

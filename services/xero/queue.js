const Queue = require('bull')
const client = require('./client')
const contacts = require('./api/contacts')

const queue = new Queue('xero-api-requests', {
  redis: process.env.REDIS_URL,
  limiter: {
    max: 60, // 60 requests
    duration: 1000 * 60, // 1 minute
  },
})

queue.process((job) => {
  const { name, query, session } = job.data
  client.setTokenSet(session.tokenSet)
  const api = {
    '/contacts': contacts(client, query),
  }
  return api[name] ?? null
})

module.exports = queue

require('dotenv').config()

const express = require('express')
const session = require('./session')
const xero = require('./services/xero')
const workspaces = require('./services/workspaces')

const app = express()

app.use(session)
app.use('/xero', xero)
app.use('/workspaces', workspaces)

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})

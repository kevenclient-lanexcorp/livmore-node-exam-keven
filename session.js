const session = require('express-session')

module.exports = session({
  resave: false,
  secret: process.env.POSTGRES_USER,
  saveUninitialized: true,
})

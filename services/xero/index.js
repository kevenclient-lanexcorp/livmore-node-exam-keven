const express = require('express')

const connect = require('./connect')
const callback = require('./callback')
const contacts = require('./contacts')

const router = express.Router()

router.get('/connect', connect)
router.get('/callback', callback)
router.get('/contacts', contacts)

module.exports = router

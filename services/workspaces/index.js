const express = require('express')
const getContacts = require('./get-contacts')
const syncContacts = require('./sync-contacts')

const router = express.Router()

router.get('/:workspaceId/contacts', getContacts)
router.get('/:workspaceId/contacts/sync', syncContacts)

module.exports = router

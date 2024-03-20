## Backend Developer Coding Test

### Endpoints

`GET` /xero/connect

`GET` /xero/callback

`GET` /xero/contacts

`GET` /xero/contacts?Ids=72b15cd9-9834-42b5-adc4-bd4abf36d95d,...

`GET` /workspaces/[:workspace_id]/contacts/sync

`GET` /workspaces/[:workspace_id]/contacts

### Express.js

Install the dependencies

```bash
npm install
```

Run the development server

```bash
node index
```

Navigate to `/workspaces/[:workspace_id]/contacts/sync` (Xero contacts will be saved together with the specified workspace ID)

### Redis

Start Redis Stack container

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

### PostgreSQL

Configure the Xero Client

```js
postgresql.js

const { Pool } = require('pg')

module.exports = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
})
```

### Xero

Configure the Xero Client

```js
services/xero/client.js

const { XeroClient } = require('xero-node')

module.exports = new XeroClient({
  clientId: process.env.XERO_CLIENT_ID,
  clientSecret: process.env.XERO_CLIENT_SECRET,
  redirectUris: [process.env.XERO_REDIRECT_URI],
  scopes: ['openid', 'profile', 'email', 'accounting.contacts.read'],
})
```
When the user visits `/workspaces/[:workspace_id]/contacts` for the first time, it will redirect to Xero authorization URL `/xero/connect` to authorize the app

```js
services/xero/connect.js

const client = require('./client')

module.exports = async (request, response) => {
  if (!request.session.origin) {
    request.session.origin = request.originalUrl
  }
  const url = await client.buildConsentUrl()
  response.redirect(url)
}
```

After the app has been authorized, it will redirect to `/xero/callback` then back to `/workspaces/[:workspace_id]/contacts`

```js
services/xero/callback.js

const client = require('./client')

module.exports = async (request, response) => {
  try {
    const tokenSet = await client.apiCallback(request.url)
    await client.updateTenants()
    request.session.tokenSet = tokenSet
    response.redirect(request.session.origin)
  } catch (error) {
    response.status(404)
      .send('404 Page Not Found')
  }
}
```

Contacts associated with the workspace

```json
[
  {
    "id": 2,
    "workspace_id": "81d47639-14e8-423d-a0d2-2ecb8974bd00",
    "xero_contact_id": "0fb3febd-8083-45be-be5d-7976a64213a4",
    "xero_contact_details": {
      "ContactID": "0fb3febd-8083-45be-be5d-7976a64213a4",
      "ContactStatus": "ACTIVE",
      "Name": "Xero Contact 002",
      "Addresses": [
        {
          "AddressType": "POBOX"
        },
        {
          "AddressType": "STREET"
        }
      ],
      "Phones": [
        {
          "PhoneType": "DDI"
        },
        {
          "PhoneType": "DEFAULT"
        },
        {
          "PhoneType": "FAX"
        },
        {
          "PhoneType": "MOBILE"
        }
      ],
      "UpdatedDateUTC": "/Date(1710915741273+0000)/",
      "ContactGroups": [
        
      ],
      "IsSupplier": false,
      "IsCustomer": false,
      "ContactPersons": [
        
      ],
      "HasAttachments": false,
      "HasValidationErrors": false
    }
  },
  ...
]
```

### Bull Queue

Configure the rate limit in Bull Queue to process `60 Xero API requests per minute`

```js
services/xero/queue.js

const Queue = require('bull')

const queue = new Queue('xero-api-requests', {
  redis: process.env.REDIS_URL,
  limiter: {
    max: 60, // 60 requests
    duration: 1000 * 60, // 1 minute
  },
})

...
```

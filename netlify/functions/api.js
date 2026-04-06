// backend/netlify/functions/api.js
import serverless from 'serverless-http'
import * as appModule from '../../src/index.js'

const app = appModule.default || appModule
export const handler = serverless(app)

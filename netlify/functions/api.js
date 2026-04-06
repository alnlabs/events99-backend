// backend/netlify/functions/api.js
import serverless from 'serverless-http'
import { app } from '../../src/index.js'

// Double-check we have the actual app function and not a module object
const finalApp = app?.default || app
export const handler = serverless(finalApp)

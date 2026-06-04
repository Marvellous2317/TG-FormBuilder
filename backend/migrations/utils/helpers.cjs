'use strict';

const fs = require('fs');
const path = require('path');

function getSchema() {
  const appConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../appConfig.json'), 'utf-8'));
  const env = process.env.NODE_ENV || appConfig.NODE_ENV || 'development';
  if (env === 'production') {
    return process.env.DB_SCHEMA || appConfig.DB_SCHEMA || appConfig.PRODUCTION_SCHEMA || 'public';
  }
  return process.env.DB_SCHEMA || appConfig.DB_SCHEMA || appConfig.UAT_SCHEMA || 'uat';
}

module.exports = { getSchema };

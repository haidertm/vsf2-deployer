const path = require('path');
const fs = require('fs');

const realPath = fs.realpathSync('./live/server');

module.exports = {
  apps: [
    {
      name: 'tiles247-web',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './live/web/server/index.mjs',
      env: {
        // Environment variables for 'tiles247-web'
      }
    },
    {
      name: 'api-server',
      port: '4000',
      exec_mode: 'cluster',
      instances: 'max',
      script: path.join(realPath, 'dist/index.js'),
      cwd: realPath,
      env: {
        // Environment variables for 'magento-api-server'
        VSF_MAGENTO_BASE_URL: 'https://tm.co.pk',
        VSF_MAGENTO_GRAPHQL_URL: 'https://tm.co.pk/graphql',
        NUXT_IMAGE_PROVIDER: 'ipx'
      }
    }
  ]
};

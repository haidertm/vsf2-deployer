module.exports = {
  apps: [
    {
      name: 'tiles247-web',
      port: '3000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './live/web/server/index.mjs'
    },
    {
      name: 'magento-api-server',
      port: '4000',
      exec_mode: 'cluster',
      instances: 'max',
      script: './live/server/src/index.ts'
    }
  ]
}

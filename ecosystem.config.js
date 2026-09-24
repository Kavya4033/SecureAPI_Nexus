module.exports = {
  apps: [
    {
      name: 'nexus-gateway',
      script: './gateway/gateway.js',
      cwd: './gateway',
      watch: true,
      env: {
        PORT: 8000,
        NODE_ENV: 'development'
      }
    },
    {
      name: 'private-backend',
      script: './backend/server.js',
      cwd: './backend',
      watch: true,
      env: {
        PORT: 5000,
        NODE_ENV: 'development'
      }
    }
  ]
};

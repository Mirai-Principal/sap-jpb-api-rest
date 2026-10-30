module.exports = {
  apps: [
    {
      name: 'backend-produccion',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        ENV_FILE: '.env.production'
      }
    },
    {
      name: 'backend-dev',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'dev',
        ENV_FILE: '.env.dev'
      }
    },
    {
      name: 'backend-sfa',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'sfa',
        ENV_FILE: '.env.sfa'
      }
    }
  ]
};
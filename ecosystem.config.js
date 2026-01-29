require('dotenv').config();

module.exports = {
    apps: [
        {
            name: process.env.NAME_PM2 || 'english-learning-ai',
            script: 'node_modules/next/dist/bin/next',
            args: `start -p ${process.env.PORT || 3000}`,
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};

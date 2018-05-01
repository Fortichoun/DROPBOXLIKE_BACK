/* eslint-disable no-unused-vars */
import path from 'path';
import dotenv from 'dotenv-safe';

/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`You must set the ${name} environment variable`);
  }
  return process.env[name];
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  dotenv.load({
    path: path.join(__dirname, '../.env'),
    // sample: path.join(__dirname, '../.env.example'),
  });
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 9005,
    ip: process.env.IP || 'localhost',
    apiRoot: process.env.API_ROOT || '/api',
    masterKey: requireProcessEnv('MASTER_KEY'),
    jwtSecret: requireProcessEnv('JWT_SECRET'),
    mongo: {
      options: {
        db: {
          safe: true,
        },
      },
    },
  },
  test: {
    mongo: {
      uri: 'mongodb://localhost/supfile',
      options: {
        debug: false,
      },
    },
  },
  development: {
    mongo: {
      uri: 'mongodb://localhost/supfile',
      options: {
        debug: true,
      },
    },
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/back-4-pjt',
    },
  },
};

module.exports = Object.assign(config.all, config[config.all.env]);
export default module.exports;

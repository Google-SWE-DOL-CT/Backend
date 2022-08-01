const {Sequelize} = require('sequelize');
const path = require('path');
require('dotenv').config();

const config = {logging:false};

if (process.env.DATABASE_URL) {
  config.dialectOptions = {
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

const db = new Sequelize(process.env.DATABASE_URL || {
  dialect: 'sqlite',
  storage: path.join(__dirname, 'db.sqlite'),
  logging: false,
});

module.exports = {db};

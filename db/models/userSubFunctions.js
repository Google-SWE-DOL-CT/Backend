/* eslint-disable require-jsdoc */
const {DataTypes, Model} = require('sequelize');
const {db} = require('../db');

class UserJob extends Model {}

UserJob.init({
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Not Started',
  },
  code: DataTypes.STRING,
  language: DataTypes.STRING,
  githubLink: DataTypes.STRING,
  screenshot: DataTypes.STRING,
  justification: DataTypes.STRING,
  adminApproval: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize: db,
  timestamps: false,
  allowNull: false,
});

module.exports = UserJob;

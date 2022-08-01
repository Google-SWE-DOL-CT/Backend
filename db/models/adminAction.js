/* eslint-disable require-jsdoc */
const {DataTypes, Model}=require('sequelize');
const {db}= require('../db');

class AdminAction extends Model {}

AdminAction.init({
  // when this is true update admin approval in UserJob
  meetsExpectations: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
  },
  comments: DataTypes.STRING,
  onJobPractice: DataTypes.INTEGER,
  mvPractice: DataTypes.INTEGER,

}, {
  sequelize: db,
  timestamps: false,
  allowNull: false,
});

module.exports = AdminAction;

/* eslint-disable require-jsdoc */
const {db} = require('../db');
const {DataTypes, Model} = require('sequelize');

class JobFunction extends Model { }

JobFunction.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
      },
    },
    {
      sequelize: db,
      timestamps: false,
    },
);

module.exports = JobFunction;

/* eslint-disable require-jsdoc */
const {db} = require('../db');
const {DataTypes, Model} = require('sequelize');

class SubFunction extends Model { }

SubFunction.init(
    {
      subId: DataTypes.FLOAT,
      papperId: DataTypes.STRING,
      outcomes: DataTypes.STRING(5000),
      job_subFunction: DataTypes.INTEGER,
    },
    {
      sequelize: db,
      timestamps: false,
    },
);

module.exports = SubFunction;

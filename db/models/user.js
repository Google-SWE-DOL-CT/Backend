/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const {db} = require('../db');
const {DataTypes, Model} = require('sequelize');
const jwt = require('jsonwebtoken');

// should be in .env file
const SECRET_KEY = process.env.SECRET_KEY;

// class User extends Model { }

// User.init(
//     {
//       firstName: DataTypes.STRING,
//       lastName: DataTypes.STRING,
//       email: {
//         type: DataTypes.STRING,
//         unique: true,
//       },
//       password: {
//         type: DataTypes.STRING,
//         /// needs to be taken out later just for now to login for dev purposes
//         defaultValue: "DOL123"
//       },
//       githubPic: DataTypes.STRING,
//       isAdmin: {
//         type: DataTypes.INTEGER,
//         // false = 0, true = 1
//         defaultValue: 0
//       }
//     },
//     {
//       sequelize: db,
//       timestamps: false,
//     },
// );

const User = db.define('user', {

  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    // / needs to be taken out later just for now to login for dev purposes
    defaultValue: 'DOL123',
  },
  githubPic: DataTypes.STRING,
  githubUsername: DataTypes.STRING,
  isAdmin: {
    type: DataTypes.INTEGER,
    // false = 0, true = 1
    defaultValue: 0,
  },
});

module.exports = User;

// instance methods here

User.prototype.generateToken = function() {
  return jwt.sign({id: this.id, isAdmin: this.isAdmin}, SECRET_KEY);
};

// class methods here

// use this after verifying github login email
User.authenticate = async function(githubUsername) {
  const user = await User.findOne({where: {githubUsername}});
  if (!user) {
    const error = Error('No user found with that githubUsername');
    error.status = 401;
    throw error;
  }
  return user.generateToken();
};


User.findByToken = async function(token) {
  try {
    const {id} = await jwt.verify(token, SECRET_KEY);
    const user = User.findByPk(id);
    if (!user) {
      throw 'Unauthorized';
    }
    return user;
  } catch (ex) {
    const error = Error('Unauthorized, Bad token');
    error.status =401;
    throw error;
  }
};

/* eslint-disable max-len */
const User = require('./user');
const JobFunction = require('./function');
const UserJob = require('./userSubFunctions');
const SubFunction = require('./subfunction');
const AdminAction = require('./adminAction');

JobFunction.hasMany(SubFunction);
SubFunction.belongsTo(JobFunction);

User.belongsToMany(SubFunction, {through: UserJob});
SubFunction.belongsToMany(User, {through: UserJob});

// these associations allow for Super Many to Many to work ie. better eager loading
User.hasMany(UserJob);
UserJob.belongsTo(User);
SubFunction.hasMany(UserJob);
UserJob.belongsTo(SubFunction);

AdminAction.hasOne(UserJob);
UserJob.belongsTo(AdminAction);

module.exports = {
  User,
  JobFunction,
  SubFunction,
  UserJob,
  AdminAction,
};

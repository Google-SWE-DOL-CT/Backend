/* eslint-disable max-len */
const path = require('path');
const fs = require('fs').promises;

// access to our model and database
const {db} = require('./db');
const {User, JobFunction, SubFunction, UserJob, AdminAction} = require('./db/models');

// define our seed function
const seedTables = async () => {
  console.log("yoooooooooooooooo!")
  // find the path to our json file
  // const userSeedPath = path.join(__dirname, './json/user.json');
  // const jobSeedPath = path.join(__dirname, './json/jobFunctions.json');
  // const subFunctionPath = path.join(__dirname, './json/subFunction.json');
  // const userJobSeedPath = path.join(__dirname, './json/userSubFunction.json');

  const userSeedPath = './json/user.json';
  const jobSeedPath = './json/jobFunctions.json';
  const subFunctionPath = './json/subFunction.json';

  const userBuffer = await fs.readFile(userSeedPath);
  const jobBuffer = await fs.readFile(jobSeedPath);
  const subFunctionBuffer = await fs.readFile(subFunctionPath);
  // const userJobBuffer = await fs.readFile(userJobSeedPath);

  const {users} = JSON.parse(String(userBuffer));
  const {jobFunctions} = JSON.parse(String(jobBuffer));
  const {subFunctions} = JSON.parse(String(subFunctionBuffer));
  // const {usersubfunctions} = JSON.parse(String(userJobBuffer));

  const jobPromises = await jobFunctions.map((job) => JobFunction.create(job));
  const subFunctionPromises = await subFunctions.map((subfunc) => SubFunction.create(subfunc));
  const userPromises = await users.map((user) => User.create(user));
  // const userJobPromises = await usersubfunctions.map((userjob) => UserJob.create(userjob));

  await Promise.all([...jobPromises, ...subFunctionPromises, ...userPromises]);

  console.log('table Data has been seeded and repleted!');
};

// create relationship between models
const matchSubFuntionToJobFunction = async () =>{
  const [job1, job2, job3, job4, job5, job6] = await JobFunction.findAll();
  const subfunctions = await SubFunction.findAll();
  subfunctions.forEach(async (subtask)=>{
    switch (subtask.job_subFunction) {
      case 1:
        await job1.addSubFunction(subtask);
        break;
      case 2:
        await job2.addSubFunction(subtask);
        break;
      case 3:
        await job3.addSubFunction(subtask);
        break;
      case 4:
        await job4.addSubFunction(subtask);
        break;
      case 5:
        await job5.addSubFunction(subtask);
        break;
      case 6:
        await job6.addSubFunction(subtask);
        break;
      default:
        console.log('theres been a problem seeding associations');
    }
  });
  console.log('job func to sub task seeds');
};

const createUserJobs = async ()=>{
  const users = await User.findAll();
  const subtasks = await SubFunction.findAll();
  users.forEach(async (user)=>{
    await user.addSubFunctions(subtasks);
    console.log('DONEEEEE');
  });
  console.log('seedsdejnkfn');
};
const createAdminActions = async ()=>{
  const userjobs = await UserJob.findAll();
  userjobs.forEach(async (userjob)=>{
    await userjob.createAdminAction({});
  });
  console.log('admin actions created');
};

const seed = async ()=>{
  await db.sync({force: true});
  await seedTables(),
  await matchSubFuntionToJobFunction(),
  await createUserJobs();
  setTimeout(async ()=>{
    await createAdminActions();
  }, 2000);
  // console.log(await UserJob.findAll())

  console.log('all seed data is seeded');
};


seed();

// export this seed function
module.exports = seed;

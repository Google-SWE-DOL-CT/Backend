/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
// const expressJwt = require('express-jwt');
// const jwks = require('jwks-rsa');
// const Sequelize = require('sequelize');
// const Op = Sequelize.Op;
require('dotenv').config();

// These get imported from the index.js file in the models folder
const {JobFunction, SubFunction} = require('../db/models');
module.exports = router;

// const securedRoute = expressJwt({
//   secret: jwks.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: process.env.JWKS_URI,
//   }),
//   audience: process.env.AUDIENCE,
//   issuer: process.env.ISSUER,
//   algorithms: ['RS256'],
// });

// GET all job functions
router.get('/', async (req, res) => {
  try {
    const jobFunc = await JobFunction.findAll();
    res.json({jobFunc});
  } catch (error) {
    res.sendStatus(500);
  }
});

// GET all job function with all subFunctions
router.get('/subtasks', async (req, res) => {
  try {
    const jobFunc = await JobFunction.findAll({include: SubFunction});
    res.json({jobFunc});
  } catch (error) {
    res.sendStatus(500);
  }
});

// GET single job function
router.get('/:jobFunctionId', async (req, res) => {
  try {
    // const user = await User.findByPk(req.params.userId);
    const singleJobFunc = await JobFunction.findOne(
        {
          where: {id: req.params.jobFunctionId},
          include: SubFunction,
        },
    );
    res.send(singleJobFunc);
  } catch (error) {
    res.sendStatus(500);
  }
});

// get single job function with all associated subfunctions
router.get('/:jobFunctionId/subtasks', async (req, res) => {
  try {
    const jobFuncWithSubFunc = await JobFunction.findOne(
        {
          where: {id: req.params.jobFunctionId},
          include: SubFunction,
        },
    );
    res.send(jobFuncWithSubFunc);
  } catch (error) {
    res.sendStatus(500);
  }
});

// get single job function with single subfunction
router.get('/:jobFunctionId/subtasks/:subFunctionId', async (req, res) => {
  try {
    const jobFuncWithSubFunc = await JobFunction.findOne(
        {
          where: {id: req.params.jobFunctionId},
          include: {
            model: SubFunction,
            where: {id: req.params.subFunctionId},
          },
        },
    );
    res.send(jobFuncWithSubFunc);
  } catch (error) {
    res.sendStatus(500);
  }
});

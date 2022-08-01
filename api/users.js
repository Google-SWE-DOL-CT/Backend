/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {uploadFile, getFileStream} = require('../s3');
const fs = require('fs');
const utils = require('util');
const unlinkFile = utils.promisify(fs.unlink);


// const expressJwt = require('express-jwt');
// const jwks = require('jwks-rsa');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
require('dotenv').config();

// These get imported from the index.js file in the models folder
const {User, JobFunction, SubFunction, UserJob, AdminAction} = require('../db/models');
const {requireToken, isAdmin} = require('./gatekeepingMW');
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

// GET all  non admin users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({where: {isAdmin: {[Op.ne]: 1}}});
    res.json({users});
  } catch (error) {
    res.sendStatus(500);
  }
});

// GET single user
router.get('/:userId', async (req, res) => {
  try {
    // const user = await User.findByPk(req.params.userId);
    const user = await User.findOne(
        {
          where: {id: req.params.userId},
          include:
            {
              model: SubFunction, include: {model: JobFunction},
            },
        },
    );
    res.send(user);
  } catch (error) {
    res.sendStatus(500);
  }
});

// GET single user single jobfunctions
router.get('/:userId/jobFunction/:jfId', async (req, res) => {
  try {
    // const user = await User.findByPk(req.params.userId);
    const user = await User.findOne(
        {
          where: {id: req.params.userId},
          include: {
            model: SubFunction,
            include: {
              model: JobFunction,
              where: {
                job_subFunction: req.params.jfId,
              },
            },
            // where: {
            //   job_subFunction: req.params.jfId,
            // },
            // all: true,
            // nested: true,
          },
        },
    );
    console.log(user);
    res.send(user);
  } catch (error) {
    res.sendStatus(500);
  }
});

// GET single user single jobfunctions
router.get('/:userId/jobFunction/:jfId/subFunction/:subId', async (req, res) => {
  try {
    const user = await User.findOne(
        {
          where: {id: req.params.userId},
          include: {
            model: SubFunction,
            where: {
              job_subFunction: req.params.jfId,
              id: req.params.subId,
            },
          },
        },
    );
    res.send(user);
  } catch (error) {
    res.sendStatus(500);
  }
});

// PUT Single user, single task, single subtask
router.put('/:userId/jobFunction/:jfId/subFunction/:subId', async (req, res) => {
  try {
    const userToUpdate = await UserJob.findOne(
        {
          where: {
            UserId: req.params.userId,
            SubFunctionId: req.params.subId,
          },
          // include: {
          //   model: SubFunction,
          //   where: {
          //     // job_subFunction: req.params.jfId,
          //     subId: req.params.subId,
          //   },
          // },
        },
    );
    await userToUpdate.update(req.body);
    console.log(userToUpdate);
    const adminInput = await AdminAction.findByPk(userToUpdate.AdminActionId);
    if (req.body.adminApproval == 0) {
      await adminInput.update({meetsExpectations: 2});
    } else {
      await adminInput.update({meetsExpectations: 1});
    }
    // await userToUpdate.SubFunctions[0].update(req.body);
    // userToUpdate.SubFunctions[0].UserJob.dataValues.code = req.body.code;
    // await userToUpdate.save();
    // console.log(userToUpdate);

    res.json({userToUpdate});
  } catch (error) {
    res.send(error.toString()).sendStatus(500);
  }
});

router.get('/switchAdmin/:userId', async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.params.userId);
    if (currentUser.isAdmin == 1) {
      await currentUser.update({isAdmin: 3});
    } else if (currentUser.isAdmin == 3) {
      await currentUser.update({isAdmin: 1});
    }
    const token = currentUser.generateToken();
    console.log(token);
    res.cookie('jwt', token, {overwrite: true});
    res.json({currentUser});
  } catch (error) {
    res.send(error.toString()).sendStatus(500);
  }
});


// POST NEW USER
// Using bcrypt encryption
router.post('/', async (req, res) => {
  bcrypt.hash(req.body.password, 2, async function(error, encrypted) {
    try {
      if (error) throw error;
      // Create a new user, storing the hashed password
      const newUser = await User.create(req.body);
      // const newUser = await User.create({
      //   firstName: req.body.firstName,
      //   lastName: req.body.lastName,
      //   location: req.body.location,
      //   password: encrypted,
      //   username: req.body.username,
      // });
      res.json({newUser});
    } catch (error) {
      res.send(error);
    }
  });
});

// UPDATE USER INFORMATION
router.put('/:userId', async (req, res) => {
  try {
    const updatedUser = await User.update(req.body, {
      where: {id: req.params.userId},
    });
    res.json({updatedUser});
  } catch (error) {
    res.sendStatus(500);
  }
});

// DELETE USER INFORMATION
router.delete('/:userId', async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await User.destroy({
      where: {
        id: userId,
      },
    });
    res.status(204).json('deleted user from database');
  } catch (error) {
    next(error);
  }
});


// upload image

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
});

router.get('/images/:imageKey', (req, res) => {
  const key = req.params.imageKey;
  const readSt = getFileStream(key);

  readSt.pipe(res);
});

router.post('/images', upload.single('file'), async (req, res) => {
  // the file is uploaded when this route is called with formdata.
  // now you can store the file name in the db if you want for further reference.
  const file = req.file;
  console.log(file);
  const result = await uploadFile(file);
  await unlinkFile(file.path);
  // console.log(result);
  // const filename = req.file.filename;
  // const path = req.file.path;
  // Call your database method here with filename and path
  res.send({imagePath: `/images/${result.Key}`});
});

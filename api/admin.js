/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const {User, JobFunction, SubFunction, UserJob, AdminAction} = require('../db/models');
const {isAdmin} = require('./gatekeepingMW');


router.get('/', async (req, res)=>{
  try {
    const needsApproval = await User.findAll({

      include: [{
        model: SubFunction,
        through: {attributes: [],
          where: {
            status: 'Ready for Review',
          },
        },
        required: true,
      }],

    });
    res.json(needsApproval);
  } catch (error) {
    console.log(error);
  }
});

router.get('/users/:userId/jobFunction/:jfId/subFunction/:subId', async (req, res) => {
  try {
    const currentUserJob = await UserJob.findOne(
        {
          where: {
            UserId: req.params.userId,
            SubFunctionId: req.params.subId,
          },
          attributes: ['AdminActionId'],
        },
    );
    // console.log(currentUserJob);
    const adminInput = await AdminAction.findByPk(currentUserJob.AdminActionId);
    res.json({adminInput});
  } catch (error) {
    res.send(error.toString()).sendStatus(500);
  }
});

router.put('/users/:userId/jobFunction/:jfId/subFunction/:subId', async (req, res) => {
  try {
    const currentUserJob = await UserJob.findOne(
        {
          where: {
            UserId: req.params.userId,
            SubFunctionId: req.params.subId,
          },
        },
    );
    console.log(currentUserJob);
    const adminInput = await AdminAction.findByPk(currentUserJob.AdminActionId);
    await adminInput.update(req.body);
    // check meet expectations
    if (req.body.meetsExpectations === 1) {
      await currentUserJob.update({adminApproval: 1, status: 'Crown'});
    } else {
      await currentUserJob.update({adminApproval: 2, status: 'In Progress'});
    }
    res.json({adminInput});
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

/* eslint-disable max-len */
// storing all of our functions that will act as mware betw our request and our response, and we will use it as we see fit
const User = require('../db/models/user');


const requireToken = async (req, res, next)=>{
  try {
    const token = req.headers.authorization;
    console.log('REQ HEAD', req.headers.authorization);
    const user = await User.findByToken(token);

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

const isAdmin = (req, res)=>{
  if (req.user.isAdmin === 0) {
    res.status(403).send('You are not authorized');
  } else {
    next();
  }
};

module.exports = {requireToken, isAdmin};

/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const express = require('express');
const router = express.Router();
// const fetch = require('node-fetch');
const axios = require('axios');
require('dotenv').config();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const {User} = require('../db/models');

const token = null;
// super basic route will need to  update for better security
router.post('/', async (req, res)=>{
  try {
    const user = await User.findOne({
      where: {
        email: {[Op.like]: req.body.email},
        password: req.body.password,
      },
    });
    if (user) {
      res.json(user);
      console.log('login successful');
    } else {
      res.send('Invalid email/password');
      console.log('login failed');
    }
  } catch (error) {
    console.log(error);
  }
});

// github OAuth

// should be in .env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.get('/github', (req, res)=>{
  const redirect_uri = `${process.env.DEPLOYED_ROUTE}/login/github/callback`;
  // const redirect_uri = `http://localhost:${process.env.PORT}/api/login/github/callback`;
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`);
});

// async function getGithubAccessToken({code, CLIENT_ID, CLIENT_SECRET}){
//     const request = await fetch("https://github.com/login/oauth/access_token", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           CLIENT_ID,
//           CLIENT_SECRET,
//           code
//         })
//     })
//         console.log('this is the request:', request)
//         const text = await request.text();
//         console.log('this ist he text', text)
//         const params = new URLSearchParams(text);
//         return params.get("access_token");
// }
router.post('/token', async (req, res, next)=>{
  try {
    console.log("TOKEN PSOT HIT")
    res.send({token: await User.authenticate(req.body.user),coms:"this got hit"})
  } catch (ex) {
    next(ex)
    
  }
})

router.get('/token', async (req, res, next)=>{
  try {
    console.log("HERES THE REQ", req.cookies)
    res.send("in the get token route")
    
  } catch (ex) {
    next(ex)
    
  }
})
async function fetchGithubUser(token) {
  const request = await axios.get('https://api.github.com/user', {
    headers: {
      Authorization: 'token ' + token,
    },
  });
  return await request;
}
 async function sendJwt(user){
  const request = await axios.post(`${process.env.DEPLOYED_ROUTE}/login/token`,{user}) 
  return await request
 }

router.get('/github/callback', async (req, res)=>{
  try {
    const body = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: req.query.code,
    };
    const opts = {headers: {accept: 'application/json'}};
    const response = await axios.post(`https://github.com/login/oauth/access_token`, body, opts);
    // console.log('this is the response:', response.data);

    const user = await fetchGithubUser(response.data.access_token);
    // console.log('this is the user:', user);

    const currentUser = await User.findOne({where: {githubUsername: {[Op.like]: user.data.login}}});
    console.log('Current User: ' + currentUser.id);

    if (currentUser) {
       const token = await User.authenticate(currentUser.githubUsername);
      // window.localStorage.setItem('jwt', token);
      res.cookie('jwt', token, {secure: true});
      res.redirect(`${process.env.DEPLOYED_ROUTE}/login/token`)
      // res.send({'jwt': token});

      const session = req.session;
      console.log('Session', session);
      // res.cookie('jwt', token, {
      //   maxAge: new Date() * 0.001 + 300,
      //   domain: 'https://serene-inlet-74805.herokuapp.com/',
      //   secure: true,
      //   sameSite: 'none',
      // });
    //   if (currentUser.isAdmin == 0) {
    //     res.redirect(`http://localhost:4200/users/${currentUser.id}`);
    //   } else {
    //     res.redirect(`http://localhost:4200/users/${currentUser.id}/admin-dashboard`);
    //   }
    // } else {
    //   res.redirect('http://localhost:4200/');
    }
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;

/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const path = require('path');
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 3000;
const app = express();
module.exports = app;

const createApp = () => {
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  app.use(cookieParser());

  app.use('/api', require('./api'));

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use(cors({
    origin: 'https://serene-inlet-74805.herokuapp.com/api',
    credentials: true,
  }));

  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      const err = new Error('Not found');
      err.status = 404;
      next(err);
    } else {
      next();
    }
  });

  app.use('*', (req, res) => {
    // res.sendFile(path.join(__dirname, './dol-swe-comp/dist/dol-swe-comp/index.html'));
    res.sendFile(path.join(__dirname, '..', 'public/index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal server error.');
  });
};

app.get('/', (req, res)=>{
  res.send('WELCOME TO THE APP');
});

// start listening (and create a 'server' object representing our server)
const startListening = () => {
  app.listen(PORT, () =>
    console.log(`Successfully procrastinating on port ${PORT}`),
  );
  // app.listen(process.env.DEPLOYED_ROUTE, () => console.log(`Successfully deployed on ${process.env.DEPLOYED_ROUTE}`))
};

async function bootApp() {
  await createApp();
  await startListening();
}

if (require.main === module) {
  bootApp();
} else {
  createApp();
}

'use strict';
require('dotenv').config();
const express = require('express');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views/pug');

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.route('/').get((req, res) => {
  res.render('index', { 
    title: 'Connected to Database', 
    message: 'Please login',
    showLogin: true,
    showRegistration: true,
    showSocialAuth: true
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});

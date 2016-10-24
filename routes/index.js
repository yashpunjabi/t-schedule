var express = require('express');
var firebase = require("firebase");

var app = express();
var router = express.Router();

var config = {
  apiKey: "AIzaSyBI42nd8krKQuOxMvRaGYLy0IbgdVRhnrs",
  authDomain: "helloworld-73694.firebaseapp.com",
  databaseURL: "https://helloworld-73694.firebaseio.com",
  storageBucket: "helloworld-73694.appspot.com",
  messagingSenderId: "72134407615"
};
firebase.initializeApp(config);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.get('/schedule', function(req, res, next) {
  res.render('schedule');
});



module.exports = router;

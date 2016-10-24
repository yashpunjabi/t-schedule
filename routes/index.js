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

app.use(function(req, res, next) {
    var auth = firebase.auth();
    auth.onAuthStateChanged(function(user) {
      if (user) {
          console.log("Logged in!");
          console.log(user);
      } else {
          console.log("Not logged in");
      }
    });
})

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

router.get('/user', function(req, res, next) {
  res.render('user');
});



module.exports = router;

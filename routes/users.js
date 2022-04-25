var express = require('express');
var router = express.Router();

const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post('/signup', function (req, res, next){
  if (!req.body.email || !req.body.password) {
      res.render('signup', {message : "Both fields are required"})
  }

  User.findOne({email: req.body.email})
  .then((foundUser) => {
      if (foundUser) {
          res.render('signup', {message: "This Username is already taken"})
      } else {
          const salt = bcrypt.genSaltSync(saltRounds)
          const hashedPass = bcrypt.hashSync(req.body.password, salt)

          User.create({
              email: req.body.email,
              fullName: req.body.fullName,
              password: hashedPass
          })
          .then((createdUser) => {
              res.render('index', {message: "You have created a new account"})
          })
      }
  })
})

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post('/login', function (req, res, next) {
  if (!req.body.email|| !req.body.password) {
      res.render('login', {message : "Both fields are required"})
  } 
  
  User.findOne({email: req.body.email})
  .then((foundUser) => {
      if (!foundUser) {
          res.render('login', {message: "This Username does not exist"})
      } else {
          let correctPassword = bcrypt.compareSync(req.body.password, foundUser.password);
          if(correctPassword) {
              req.session.user = foundUser;
              res.render('index', {message: "You have logged in"})
          } else {
              res.render('login', {message: "Incorrect Password"})
          }
      }
  })
})

router.get("/logout", (req, res, next) => {
  req.session.destroy();
  res.render('index', {
      message: "You have logged out!"
  })

})

module.exports = router;

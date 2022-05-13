var express = require('express');
var router = express.Router();

const Campaign = require("../models/Campaign.model");
const Pledge = require('../models/Pledge.model');


router.get('/', function(req, res, next) {
  Campaign.find()
  .sort({"createdAt": -1}).limit(3)
  .then(function(campaigns){
    Pledge.find()
    .populate('user')
    .sort({"createdAt": -1}).limit(3)
    .then(function (pledges){
    res.render('index', {title: "Fundraise for Ukraine", campaigns: campaigns, pledges: pledges})
    })
    .catch(function(err){
      console.log('failed', err.message)
    })
  })
  .catch(function(err){
    console.log('failed', err.message)
    
  })
  
});

module.exports = router;

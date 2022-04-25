var express = require('express');
var router = express.Router();
const Pledge = require("../models/Pledge.model");
const Campaign = require("../models/Campaign.model");
const isLoggedIn = require('../middleware/isLoggedIn');
const isNotOwner = require('../middleware/isNotOwner');


router.get('/:id/add-pledge', isLoggedIn, isNotOwner, function(req, res, next) {
    Campaign.findById(req.params.id)
    .then (function (foundCampaign) {
      res.render('add-pledge', {foundCampaign: foundCampaign});
  })
    .catch(function (error) {
      console.log(error);
    });
  })
  
router.post('/:id/add-pledge', isLoggedIn, isNotOwner, (req, res, next) => {

    Pledge.create({
        user: req.session.user._id,
        comment: req.body.comment
      })
      .then(function (newPledge){
        Campaign.findByIdAndUpdate(
            {_id: req.params.id},
            {$addToSet: {reviews: newPledge}}
        )
        .then(function () {
          res.redirect("/campaigns/campaigns-list");
        })
      })
      .catch(function (error) {
        res.json(error);
      });
  });

module.exports = router;



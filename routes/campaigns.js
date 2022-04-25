var express = require('express');
var router = express.Router();
const Campaign = require("../models/Campaign.model");
const isLoggedIn = require('../middleware/isLoggedIn');
const isOwner = require('../middleware/isOwner');


router.get("/create-campaign", isLoggedIn, function (req, res, next) {
  res.render("create-campaign");
});

router.post('/create-campaign', isLoggedIn, (req, res, next) => {
  Campaign.create({
    name: req.body.name,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    owner: req.session.user._id,
    // reviews: req.body.reviews
  })
    .then(function (createdRooms) {
      res.redirect('/campaigns/my-campaigns')

    })
    .catch(function (error) {
      res.redirect('/')

    });

});


router.get('/campaigns-list', (req, res, next) => {
  Campaign.find()
  .populate({
    path: "reviews",
    populate: {
      path: "user",
    },
  })
  .then(function(campaigns){
    res.render('campaigns-list', {campaigns: campaigns})
  })
  .catch(function (error) {
    console.log(error);

  } );

});


router.get("/my-campaigns", isLoggedIn, function (req, res, next) {
  Campaign.find({owner: req.session.user._id})
  .populate({
    path: "reviews",
    populate: {
      path: "user",
    },
  })
  .then(function(myCampaigns){
    res.render('my-campaigns', {myCampaigns: myCampaigns})
  })
  .catch(function (error) {
    console.log(error);

  } );

});

router.post('/:id/delete', isOwner, (req, res, next) => {

  Rooms.findByIdAndRemove(req.params.id)
    .then(function () {
      res.redirect("/campaigns/my-campaigns");
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.get('/:id/edit', isLoggedIn, isOwner, (req, res, next) => {

  Campaign.findById(req.params.id)

  .then(function(campaign){
    res.render('edit-campaign', {campaign: campaign})
  })
  .catch(function (error) {
    console.log(error);

  } );
});

router.post('/:id/edit', isLoggedIn, isOwner, (req, res, next) => {

  Campaign.findByIdAndUpdate(req.params.id, {...req.body})
    .then(function () {
      res.redirect("/campaigns/my-campaigns");
    })
    .catch(function (error) {
      res.json(error);
    });
});


module.exports = router;
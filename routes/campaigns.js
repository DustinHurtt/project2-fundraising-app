var express = require('express');
var moment = require('moment')
const { DateTime }  = require('luxon')
const { Interval }  = require('luxon')
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
    duration: req.body.duration,
    goal: req.body.goal,
    rawDeadline: new Date( Date.now() + req.body.duration * 6.048e+8),
    deadline: new DateTime( Date.now() + req.body.duration * 6.048e+8).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
    // timeLeft: ""


  })
    .then(function (createdCampaigns) {

      res.redirect('/campaigns/my-campaigns')

    })
    .catch(function (error) {
      console.log(error.message)
      res.redirect('/')

    });

});


router.get('/campaigns-list', async (req, res, next) => {

  //this updates
  await Campaign.find().cursor().eachAsync( function (campaign){
    campaign.timeLeft = Interval.fromDateTimes((new Date(Date.now())), campaign.rawDeadline).toDuration(['days', 'hours', 'minutes', 'seconds']).toObject();
    campaign.percent = Math.round(campaign.currentTotal / campaign.goal * 100);
    campaign.donations = campaign.pledges.length;
    campaign.readableTotal = campaign.currentTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }),
    campaign.readableGoal = campaign.goal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    })

    return campaign.save()
    })

  Campaign.find()
  .populate({
    path: "pledges",
    perDocumentLimit: 3,
    options: { sort: { 'createdAt': -1 } },
    populate: {
      path: "user",
    },
  })
  // .sort({"createdAt": -1})
  
  .then(function(campaigns){

    res.render('campaigns-list', {campaigns: campaigns})
    })


    .catch(function (error) {
      console.log(error);
  
    });


  })


router.get("/my-campaigns", isLoggedIn, async function (req, res, next) {

  await Campaign.find({owner: req.session.user._id}).cursor().eachAsync( function (myCampaign){
    myCampaign.timeLeft = Interval.fromDateTimes((new Date(Date.now())), myCampaign.rawDeadline).toDuration(['days', 'hours', 'minutes', 'seconds']).toObject();
    myCampaign.percent = Math.round(myCampaign.currentTotal / myCampaign.goal * 100);
    myCampaign.donations = myCampaign.pledges.length;
    myCampaign.readableTotal = myCampaign.currentTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }),
    myCampaign.readableGoal = myCampaign.goal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    })

    return myCampaign.save()
    })

  Campaign.find({owner: req.session.user._id})
  .populate({
    path: "pledges",
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

  Campaign.findByIdAndRemove(req.params.id)
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
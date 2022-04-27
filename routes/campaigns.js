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
    deadline: new Date( Date.now() + req.body.duration * 6.048e+8).toLocaleString(DateTime.DATETIME_FULL),
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
    })


    //create a calculation to determine how much real time this is
    return campaign.save()
    })


    //this fetches
  Campaign.find()
  .populate({
    path: "pledges",
    perDocumentLimit: 3,
    options: { sort: { 'createdAt': -1 } },
    populate: {
      path: "user",
    },
  })
  .sort({"createdAt": -1})
  
  .then(function(campaigns){

    // campaigns.forEach(function(doc){




  
    //   var updatedTimeLeft = doc.rawDeadline - 2 * 6.048e+8;
    // })
    //   campaigns.update( {_id: doc._id}, {
    //       // timeLeft: new Date (campaigns.rawDeadline - 2 * 6.048e+8)
    //       // timeLeft: updatedTimeLeft

    //       // timeLeft: updatedTimeLeft
    //       $set:{timeLeft: updatedTimeLeft}
    
    //     }, {multi: true})
      
      
      // ({_id: doc._id},{$set:{"timeLeft": updatedTimeLeft}});


    console.log(campaigns)
  // })

//   t.forEach(function( aRow ) {
//     var newFields = [];
//     aRow.fields.forEach( function( aField ){
//         var newItems = [];
//         aField.items.forEach( function( item ){
//             var aNewItem = { item: parseInt(item), ref: 0 };
//             newItems.push( aNewItem );
//         } );
//         newFields.push({ _id: aField._id, items: newItems });
//     } )
//     aTable.update(
//         { _id: aRow._id }, 
//         { "$set": { "fields": newFields } }
//     );
// });


  //   let now = new Date (Date.now())
  //   console.log(now)
  //   console.log(campaigns.rawDeadline)
  //   console.log(campaigns)
  //   let timeLeftTry =Interval.fromDateTimes((new Date(Date.now())), campaigns.rawDeadline).toDuration(['hours', 'minutes', 'seconds']).toObject()
  //  consoloe.log(timeLeftTry)
    // Campaign.updateMany({
    //   // timeLeft: new Date (campaigns.rawDeadline - 2 * 6.048e+8)
    //   timeLeft: Interval.fromDateTimes((new Date(Date.now())), campaigns.rawDeadline).toDuration(['hours', 'minutes', 'seconds']).toObject()

    // })
    // console.log(campaigns.timeLeft)
    // .then(function(campaigns) {
    //   Campaign.find()
    //   .populate({
    //     path: "pledges",
    //     populate: {
    //       path: "user",
    //     },
    res.render('campaigns-list', {campaigns: campaigns})
    })
    // .then(function(campaigns) {
      // res.render('campaigns-list', {campaigns: campaigns})

    // })

    .catch(function (error) {
      console.log(error);
  
    });


  })




  // })


// });


router.get("/my-campaigns", isLoggedIn, function (req, res, next) {
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
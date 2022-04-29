var express = require("express");
var router = express.Router();

// const app = express();
// This is your test secret API key.

const { DateTime }  = require('luxon')
const { Interval }  = require('luxon')

const Pledge = require("../models/Pledge.model");
const Campaign = require("../models/Campaign.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const isNotOwner = require("../middleware/isNotOwner");

// const {initialize, handleSubmit, checkStatus, showMessage, setLoading} = require('../stripe/checkout')

// const YOUR_DOMAIN = "http://localhost:3000";
const YOUR_DOMAIN = "https://project2-fundraising-app.herokuapp.com/";

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51KsWiCCdp1vgefLQKH9l6LqdtZtb6BZbWHto4TGmHjVgsunIY5BEjnEguKXd8l3SGtBWdXi0AWBO4B4zxxlHor1q00FBCa4Cya"
);

// app.use(express.static("public"));
// app.use(express.json());

router.get(
  "/:id/add-pledge", 
  isLoggedIn,
  isNotOwner,
  async function (req, res, next) {

    await Campaign.findById(req.params.id).cursor().eachAsync( function (campaign){
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
      }),
      campaign.deadline = campaign.rawDeadline.toLocaleString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})
  
  
      return campaign.save()
      })

    Campaign.findById(req.params.id)
    .populate({
      path: "pledges",
      options: { sort: { 'createdAt': -1 } },
      populate: {
        path: "user",
      },
    })
      .then(function (foundCampaign) {
        // res.render('add-pledge', {foundCampaign: foundCampaign});
        res.render("checkout", { foundCampaign: foundCampaign });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
);

router.post("/:id/add-pledge", isLoggedIn, isNotOwner, (req, res, next) => {
  Pledge.create({
    user: req.session.user._id,
    comment: req.body.comment,
    amount: req.body.amount,
  })
    .then(function (newPledge) {
      Campaign.findByIdAndUpdate(
        { _id: req.params.id },
        { $addToSet: { pledges: newPledge } }
      ).then(function () {
        res.redirect("/campaigns/campaigns-list");
      });
    })
    .catch(function (error) {
      res.json(error);
    });
});

router.post('/:id/create-checkout-session', async (req, res) => {

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: req.body.price_ID,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}/campaigns/campaigns-list`,
    cancel_url: `${YOUR_DOMAIN}/users/login`,
  });


  try {
    let newPledge = await Pledge.create({
      user: req.session.user._id,
      comment: req.body.comment,
      amount: session.amount_total / 100,
    });

    let updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id ,
      { $addToSet: { pledges: newPledge }, $inc: {currentTotal: session.amount_total / 100} },
      { new: true }
    );

    console.log("Success", updatedCampaign);
  } catch (err) {
    console.log("Something went wrong", err.message);
  }

  res.redirect(303, session.url);
});



module.exports = router;

var express = require('express');
var router = express.Router();

// const app = express();
// This is your test secret API key.

const Pledge = require("../models/Pledge.model");
const Campaign = require("../models/Campaign.model");
const isLoggedIn = require('../middleware/isLoggedIn');
const isNotOwner = require('../middleware/isNotOwner');

// const {initialize, handleSubmit, checkStatus, showMessage, setLoading} = require('../stripe/checkout')

const Stripe = require('stripe');
const stripe = Stripe('sk_test_51KsWiCCdp1vgefLQKH9l6LqdtZtb6BZbWHto4TGmHjVgsunIY5BEjnEguKXd8l3SGtBWdXi0AWBO4B4zxxlHor1q00FBCa4Cya');

// app.use(express.static("public"));
// app.use(express.json());


router.get('/:id/add-pledge', isLoggedIn, isNotOwner, function(req, res, next) {
    Campaign.findById(req.params.id)
    .then (function (foundCampaign) {
      // res.render('add-pledge', {foundCampaign: foundCampaign});
      res.render('checkout')
  })
    .catch(function (error) {
      console.log(error);
    });
  })
  
router.post('/:id/add-pledge', isLoggedIn, isNotOwner, (req, res, next) => {

    Pledge.create({
        user: req.session.user._id,
        comment: req.body.comment,
        amount: req.body.amount
      })
      .then(function (newPledge){
        Campaign.findByIdAndUpdate(
            {_id: req.params.id},
            {$addToSet: {pledges: newPledge}}
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




const calculateOrderAmount = (items, amount) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

router.post("/create-payment-intent/", async (req, res) => {
  const { items } = req.body;
  console.log(req.body)

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items, req.params.amount),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

// app.listen(4242, () => console.log("Node server listening on port 4242!"));



const Campaign = require("../models/Campaign.model");

const isOwner = (req, res, next) => {
  Campaign.findById(req.params.id)
    .populate("owner")
    .then((foundCampaign) => {
      if (foundCampaign.owner._id.toHexString() === req.session.user._id) {
        next();
      } else {
        res.render("index", {
          message: "You must be logged in to access that feature",
        });
      }
    });
};

module.exports = isOwner;

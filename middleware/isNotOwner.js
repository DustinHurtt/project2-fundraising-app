const Campaign = require("../models/Campaign.model")

const isNotOwner= (req, res, next) => {

    Campaign.findById(req.params.id)
    .populate('owner')
    .then(foundCampaign => {

        if (foundCampaign._id.toHexString() !== req.session.user._id){
            next()
        } else {
            res.render('index', {
                message: "You cannot add reviews to your own listing"
            })
        }
    })

}

module.exports = isNotOwner
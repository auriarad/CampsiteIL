const Campsite = require('../models/campsite');
const Review = require('../models/review');

module.exports.create = async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campsite.reviews.push(review);
    await review.save();
    await campsite.save();
    res.redirect(`/campsites/${id}`);
}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campsite.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campsites/${id}`);
}

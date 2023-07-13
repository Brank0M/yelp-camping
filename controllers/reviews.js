const Campground = require("../models/campground");
const Review = require("../models/review");


module.exports.createReview = async (req, res) => { // create review
    const { id } = req.params; // get campground id from params
    const campground = await Campground.findById(id); // find campground by id
    const review = new Review(req.body.review); // create new review
    review.author = req.user._id; 
    campground.reviews.push(review); // add review to campground
    await review.save(); // save review
    await campground.save(); // save campground
    req.flash("success", "Review created successfully!"); // set up success flash message 
    res.redirect(`/campgrounds/${campground._id}`); // redirect to campground page
}

module.exports.deleteReview = async (req, res) => { // delete review
    const { id, reviewId } = req.params; // get campground id and review id from params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }}); // remove review from campground
    await Review.findByIdAndDelete(reviewId); // remove review
    req.flash("success", "Review deleted successfully!"); // set up success flash message
    res.redirect(`/campgrounds/${id}`); // redirect to campground page
}


const ExpressError = require("./utils/ExpressError");   
const { campgroundSchema, reviewSchema } = require("./schemas.js"); 
const Campground = require("./models/campground"); 
const Review = require("./models/review");


module.exports.isLoggedIn = (req, res, next) => { // middleware
    if(!req.isAuthenticated()) {  // isAuthenticated() is a method provided by passport
        req.session.returnTo = req.originalUrl;  // set up session returnTo
        req.flash("error", "You must be signed in first!");  // set up error flash message
        return res.redirect("/login");  // redirect to login page
    }
    next();  // if everything is ok, continue
};

module.exports.validateCampground = (req, res, next) => {  // validate campground
    const { error } = campgroundSchema.validate(req.body);  
    if(error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {  // check if user is author
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit this campground!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {  // check if user is author
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to edit this campground!");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {  
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer  = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// INDEX ROUTE - show all campgrounds (GET) 
// POST ROUTE - add new campground (POST) 
router.route("/")  // Set up route
    .get(catchAsync(campgrounds.index))  // set up index route
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));  // set up create route



// GET /campgrounds/new - show new campground form (renderNewForm)
router.get("/new", isLoggedIn, campgrounds.renderNewForm);  // set up new route

// GET ROUTE - show form to showCampground (GET)
// PUT ROUTE - updateCampground (PUT)
// DELETE ROUTE - deleteCampground (DELETE)
router.route("/:id") // Set up route    
    .get(catchAsync(campgrounds.showCampground)) // set up showCampground route    
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))  // set up update route
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));  // set up delete route

// GET /campgrounds/:id/edit - show edit campground form (renderEditForm)
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));  // set up edit route


module.exports = router; // export router
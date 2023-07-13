const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {  // get & set all campgrounds
    const campgrounds = await Campground.find({});  // get all campgrounds
    res.render("campgrounds/index", { campgrounds });  // render index view
}

module.exports.renderNewForm = (req, res) => {  // get & set new campground form
    res.render("campgrounds/new");  // render new view
}

module.exports.createCampground = async (req, res, next) => {  // post % set up create route

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    // const geoData = await geocoder.forwardGeocode({  // get geoData from mapbox
        // query: req.body.campground.location,  // get location from form
        // limit: 1  // limit to 1 result
    // }).send();

    const campground = new Campground(req.body.campground);  // create a new campground

    campground.geometry = geoData.body.features[0].geometry; // send coordinates to client

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));  // add images to campground
    campground.author = req.user._id;  // set campground author to logged in user
    await campground.save();  // save the campground
    console.log(campground);  // log campground
    req.flash("success", "Campground created successfully!");  // set up success flash message
    res.redirect(`/campgrounds/${campground._id}`);  // redirect to campground
}

module.exports.showCampground = async (req, res) => {  // get & set campground
    const campground = await Campground.findById(req.params.id).populate({ // get campground by id
        path: "reviews", // populate reviews
        // options: { sort: { createdAt: -1 } } // sort by createdAt in descending order
            populate: {  
                path: "author",
             }
            }).populate("author");  // get campground by id
    if(!campground) {  // if no campground found
        req.flash("error", "Campground not found!");  // set up error flash message
        return res.redirect("/campgrounds");  // redirect to campgrounds
    }  
        res.render("campgrounds/show", { campground }); // render show view
}

module.exports.renderEditForm = async (req, res) => { // get & set edit campground form
    const { id } = req.params; // get campground id
    const campground = await Campground.findById(id); // get campground by id
    if(!campground) { // if no campground found
        req.flash("error", "Campground not found!"); // set up error flash message
        return res.redirect("/campgrounds");  // redirect to campgrounds
    } 
    res.render("campgrounds/edit", { campground }); // render edit view
}

module.exports.updateCampground = async (req, res) => {	// put & set update campground route
    const { id } = req.params; // get campground id
    console.log(req.body); // log req.body
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });  // update campground
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); // add images to campground
    campground.images.push (...imgs); // push images to campground
    await campground.save();  // save the campground
    if(req.body.deleteImages) { // if deleteImages is in req.body
        for(let filename of req.body.deleteImages) { // for each filename in deleteImages
            await cloudinary.uploader.destroy(filename); // delete image from cloudinary
        }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }); // delete images from campground
    }
    req.flash("success", "Campground updated successfully!"); // set up success flash message
    res.redirect(`/campgrounds/${campground._id}`); // redirect to campground
}

module.exports.deleteCampground = async (req, res) => {	 // delete & set delete campground route
    const { id } = req.params; // get campground id	
    await Campground.findByIdAndDelete(id); // delete campground	
    req.flash("success", "Campground deleted successfully!"); // set up success flash message
    res.redirect("/campgrounds"); // redirect to campgrounds	
}
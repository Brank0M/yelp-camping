const User = require("../models/user");  // Import User Model


module.exports.renderRegister = (req, res) => {  // set up register route
    res.render("users/register");  // render register view
}

module.exports.register = async(req, res) => {  // set up register route
    try {
    const {email, username, password} = req.body;  // create a new user
    const user = new User({email, username});  // create a new user
    const registerdUser = await User.register(user, password);  // register the user
    req.login(registerdUser, (err) => {  // login the user
        if(err) return next(err);  // if there is an error, return the error
        req.flash("success", "Welcome to YelpCamp!");  // set up success flash message
        res.redirect("/campgrounds");  // redirect to campgrounds
    })
    } catch (err) {
        req.flash("error", err.message);  // set up error flash message
        res.redirect("/register");  // redirect to register page
    }
}

module.exports.renderLogin =  (req, res) => {  // set up login route
    res.render("users/login");  // render login view
}

module.exports.login = (req, res) => {  // set up login route
    req.flash("success", "You've successfully logged in!");  // set up success flash message
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);  // redirect to campgrounds

}

module.exports.logout = async (req, res, next) => { // set up logout route
    req.logout( function (err) { // logout the user
        if (err) { // if there is an error, return the error
            return next(err); // return the error
        }
        req.flash("success", "You've successfully logged out!!"); // set up success flash message
        res.redirect("/campgrounds"); // redirect to campgrounds
    });
}
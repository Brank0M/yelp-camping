const express = require("express");  // Import Express
const router = express.Router();  // Create a Router
const catchAsync = require("../utils/catchAsync");  // Import Catch Async
const User = require("../models/user");  // Import User Model
const passport = require("passport"); // Import Passport
const users = require("../controllers/users");  // Import Users Controller

// GET /register - show register form
// POST /register - create new user
router.route("/register")  // Set up route
    .get(users.renderRegister) // Set up register route
    .post(catchAsync (users.register)); // Set up register route

// GET /login - show login form
// POST /login - login user
router.route("/login")  // Set up route
    .get(users.renderLogin) // Set up login route
    .post(passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }), users.login); // Set up login route

// GET /logout - logout user    
router.get("/logout", users.logout); // Set up logout route


module.exports = router;  // Export the router
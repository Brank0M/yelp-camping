if (process.env.NODE_ENV !== "production") {
    require('dotenv').config(); 
}


const express = require("express");  // Import Express
const path = require("path");  // Import Path
const mongoose = require("mongoose");  // Import Mongoose
const ejsMate = require("ejs-mate");  // Import EJS-Mate
const session = require("express-session");  // Import Express Session
const flash = require("connect-flash");  // Import Connect Flash
const ExpressError = require("./utils/ExpressError");  // Import Express Error
const methodOverride = require("method-override");  // Import Method Override
const passport = require("passport");  // Import Passport
const LocalStrategy = require("passport-local");  // Import Local Strategy
const User = require("./models/user");  // Import User Model
const mongoSanitize = require('express-mongo-sanitize');  // Import Mongo Sanitize
const helmet = require("helmet");  // Import Helmet


const userRoutes = require("./routes/users");  // Import User Routes
const campgroundRoutes = require("./routes/campgrounds");  // Import Campgrounds Routes
const reviewRoutes = require("./routes/reviews");  // Import Reviews Routes

// const { MongoStore } = require("connect-mongo");  // Import Mongo Store
const MongoDBStore = require("connect-mongo");  // Import MongoDB Store

const dbUrl =  process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";  // Set DB URL - process.env.DB_URL ||

mongoose.connect(dbUrl);  // Connect to MongoDB

const db = mongoose.connection;  // Create a variable to hold the connection
db.on("error", console.error.bind(console, "connection error:"));  // Log any errors
db.once("open", function() {  // Once the connection is open
    console.log("Connected to Mongoose!");  // Log that we're connected
}); 

const app = express();  // create our app w/ express

app.engine("ejs", ejsMate);  // set up ejs for templating
app.set("view engine", "ejs");  // use ejs for templating
app.set("views", path.join(__dirname, "views"));  // set up where express will look for templates

app.use(express.urlencoded({ extended: true }));  // set up body parsing middleware
app.use(methodOverride("_method"));  // allow PUT and DELETE methods to be used with forms
app.use(express.static(path.join(__dirname, "public")));  // set up static file middleware
app.use(mongoSanitize({  // set up mongo sanitize middleware
    replaceWith: "_"
}));

const secret = process.env.SECRET || "thisshouldbeabettersecret!";  // set up secret

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
    crypto: {
      secret: 'squirrel'
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {  // set up session config
    store,
    name: "session",
    secret,  // set a secret to sign the session ID cookie
    resave: false,  // don't save session if unmodified
    saveUninitialized: false,  // don't save session if unmodified
    cookie: { 
        httpOnly: true,  // don't let JavaScript access cookies
        // secure: true,  // only send cookies over https
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),  // set session cookie to expire in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7  // set session cookie to expire in 7 days
}};

// Set up session middleware
app.use(session(sessionConfig));  // must be before router
app.use(flash());  // set up flash messages


// Set up passport middlewares
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/brankqvist-cloud/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/brankqvist-cloud/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/brankqvist-cloud/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/brankqvist-cloud/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc   : [ "https://res.cloudinary.com/brankqvist-cloud/" ],
            childSrc   : [ "blob:" ],
        },
    })
);

// Set up passport
app.use(passport.initialize());  // initialize passport
app.use(passport.session());  // set up passport session
passport.use(new LocalStrategy(User.authenticate()));  // set up local strategy

// Serialize and deserialize user
passport.serializeUser(User.serializeUser());  // set up serializeUser
passport.deserializeUser(User.deserializeUser());  // set up deserializeUser

// Middleware to pass currentUser to all templates
app.use((req, res, next) => {  // set up global variables
    console.log(req.query);  // log the query string
    res.locals.currentUser = req.user;  // set currentUser to req.user
    res.locals.success = req.flash("success");  // set up success flash messages
    res.locals.error = req.flash("error");  // set up error flash messages
    next();  // continue to next middleware
});

// Routes
app.use("/", userRoutes);  // use the user routes
app.use("/campgrounds", campgroundRoutes);  // use campgrounds routes
app.use("/campgrounds/:id/reviews", reviewRoutes);  // use reviews routes

// Error Handling
app.get("/", (req, res) => {
    res.render("home");
});

// 404
app.all("*", (req, res, next) => {  // catch all route
    next(new ExpressError("Page Not Found", 404));  // pass ExpressError to next middleware
});

// Error Handling
app.use((err, req, res, next) => {  // error handler
    const { statusCode = 500 } = err;  // default status code to 500
    if(!err.message) err.message = "Oh No! Something went wrong";  // default error message
    res.status(statusCode).render("error", { err});  // render error page
});

// Listen

const port = process.env.PORT || 3000;  // set port

app.listen(port, () => {  // start listening on port 3000
    console.log(`Serving on port ${port}`);  // log to console
});
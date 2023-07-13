const mongoose = require("mongoose");  
const cities = require("./cities");  
const { places, descriptors } = require("./seedHelpers");   
const Campground = require("../models/campground");     

mongoose.connect("mongodb+srv://our-first-user:eZgmMSKqTQJDUNFB@cluster0.8f1xacm.mongodb.net/?retryWrites=true&w=majority");  

const db = mongoose.connection;  
db.on("error", console.error.bind(console, "connection error:"));  
db.once("open", function() {
    console.log("Connected to Mongoose!");  
}); 

const sample = array => array[Math.floor(Math.random() * array.length)];      

const seedDB = async () => {    
    await Campground.deleteMany({});    
    for (let i = 0; i < 300; i++) {      
        const random1000 = Math.floor(Math.random() * 1000);  
        const price = Math.floor(Math.random() * 20) + 10;  
        const camp = new Campground({   
            // YOUR USER ID
            author: "63387c1221979545e343bd95",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eos pariatur officiis ipsum accusamus illum perferendis inventore fugit error, nostrum quos assumenda recusandae suscipit aut minima debitis unde ea amet alias.",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                  cities[random1000].longitude, 
                  cities[random1000].latitude
                ]
            },  
            images: [
                {
                  url: "https://res.cloudinary.com/brankqvist-cloud/image/upload/v1664695795/YelpCamp/camp1_14_p1s9kz.jpg",
                  filename: "camp1_14_p1s9kz"
                },
                {
                  url: "https://res.cloudinary.com/brankqvist-cloud/image/upload/v1664695793/YelpCamp/camp1_10_jgtrbv.jpg",
                  filename: "camp1_10_jgtrbv"
                },
                {
                  url: "https://res.cloudinary.com/brankqvist-cloud/image/upload/v1664695794/YelpCamp/camp1_9_rqubkl.jpg",
                  filename: "camp1_9_rqubkl"
                },
                {
                  url: "https://res.cloudinary.com/brankqvist-cloud/image/upload/v1664669209/YelpCamp/jzkozcf0fazej47mj35m.jpg",
                  filename: "jzkozcf0fazej47mj35m"
                },
                {
                  url: "https://res.cloudinary.com/brankqvist-cloud/image/upload/v1663672129/YelpCamp/wcexwqpltf6gcm8eyyyk.jpg",
                  filename: "wcexwqpltf6gcm8eyyyk"
                },
                {
                  url: "https://res.cloudinary.com/brankqvist-cloud/image/upload/v1664733221/YelpCamp/camp1_17_xs21d8.jpg",
                  filename: "camp1_17_xs21d8"
                }
                ]
    })
        await camp.save();      
    }
}
seedDB().then(() => {
    mongoose.connection.close();
})

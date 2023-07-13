const mongoose = require("mongoose"); // require mongoose
const Review = require("./review"); // require review model
const Schema = mongoose.Schema; // create a new Schema object

const ImageSchema = new Schema( // create a new ImageSchema object
    {
        url: String,
        filename: String
    }
);

ImageSchema.virtual("thumbnail").get(function() { // create a virtual property
    return this.url.replace("/upload", "/upload/ar_5.0,c_fit,h_250,w_400"); // return the url with a width of 200
});

const opts = { toJSON: { virtuals: true } }; // create a new opts object

const campgroundSchema = new Schema({ // campgroundSchema is a new instance of Schema
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
          type: String, 
          enum: ["Point"], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

campgroundSchema.virtual("properties.popUpMarkup").get(function() { 
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        
        <p>${this.price} $ per night<br>${this.description.substring(0, 20)}...</p>`; // return the title of the campground
});

campgroundSchema.post("findOneAndDelete", async function(doc) {
    if(doc.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: doc.reviews } });
    }  // if there are reviews, delete them
});

module.exports = mongoose.model("Campground", campgroundSchema);    // Campground is the name of the collection in the database.

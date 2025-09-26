const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "listingimage", 
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1667987566780-3b31fa5485c8?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1667987566780-3b31fa5485c8?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          : v,
    },
  },
  // New: support multiple images (up to 3). Keep old `image` for compatibility
  images: [
    {
      filename: String,
      url: String,
    },
  ],
  price: Number,
  location: String,
  country: String,
  category: {
    type: String,
    enum: [
      'Trending',
      'Rooms',
      'Iconic Cities',
      'Mountains',
      'Castles',
      'Amazing Pools',
      'Camping',
      'Farms',
      'Arctic',
      'Domes',
      'Boats'
    ],
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if(listing){
    await Review.deleteMany({_id: { $in: listing.reviews }});
  }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
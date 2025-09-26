const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listing.js");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
 .route("/")
 .get(wrapAsync(listingController.index))
 .post(isLoggedIn, validateListing, upload.array("images", 3), wrapAsync(listingController.createListing)
 );

//new Route
router.get("/new", isLoggedIn,  wrapAsync(listingController.renderNewForm));

router.route("/:id")
 .get(wrapAsync(listingController.showListing))
 .put(isLoggedIn, isOwner, validateListing, upload.array("images", 3), wrapAsync(listingController.updatelisting))
 .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner,  wrapAsync(listingController.renderEditForm));

module.exports = router;
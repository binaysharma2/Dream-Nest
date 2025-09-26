const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const { q = "", country = "", category = "" } = req.query || {};

    const filter = {};
    if (q) {
        const regex = new RegExp(q, "i");
        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { description: regex },
        ];
    }
    if (country) {
        filter.country = new RegExp(country, "i");
    }
    if (category) {
        filter.category = category;
    }
    const allListings = await Listing.find(filter);
    const filters = { q, country, category };
    res.render("listings/index.ejs", { allListings, filters });   
};

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author" },}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exits");
        return res.redirect("/listings"); 
    }
    const mapQuery = `${listing.location || ''} ${listing.country || ''}`.trim();
    res.render("listings/show.ejs", { listing, mapQuery });
};

module.exports.createListing = async (req, res) => {
    let listingData = { ...req.body.listing };
   
    // Combine uploaded files and optional URL from form into images[]
    const uploadedImages = (req.files || []).slice(0,3).map(f => ({
        filename: f.filename,
        url: f.path
    }));
    const rawUrl = req.body.listing && req.body.listing.image ? String(req.body.listing.image).trim() : "";
    const normalizedUrl = rawUrl
        ? (/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`)
        : "";
    const textImage = normalizedUrl ? [{ filename: "listingimage", url: normalizedUrl }] : [];
    const images = [...uploadedImages, ...textImage].slice(0,3);
    if (images.length > 0) {
        listingData.images = images;
        // For backward compatibility also set primary image
        listingData.image = images[0];
    }

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings"); 
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested does not exits");
        return res.redirect("/listings"); 
    }
    res.render("listings/edit.ejs", { listing })
};

module.exports.updatelisting = async (req, res, next) => {
    let { id } = req.params;
    let updatedData = { ...req.body.listing };

    const existing = await Listing.findById(id);
    if (!existing) {
        throw new ExpressError(404, "Listing not found");
    }

    // Handle deletions for images
    const deletes = Array.isArray(req.body.deleteImages)
        ? req.body.deleteImages
        : (req.body.deleteImages ? [req.body.deleteImages] : []);
    let keptImages = (existing.images && existing.images.length)
        ? existing.images.filter(img => !deletes.includes(img.url))
        : (existing.image ? [existing.image] : []);
    keptImages = keptImages.filter(img => !deletes.includes(img.url));

    // Unlink deleted local files
    const deletedLocal = deletes.filter(u => u.startsWith('/uploads/'));
    for (const rel of deletedLocal) {
        try {
            const abs = path.join(__dirname, '..', 'public', rel.replace(/^\/+/, ''));
            if (fs.existsSync(abs)) fs.unlinkSync(abs);
        } catch (e) {
            // ignore unlink errors
        }
    }

    // Build incoming images from uploaded files and optional URL field
    const uploadedImages = (req.files || []).slice(0,3).map(f => ({
        filename: f.filename,
        url: f.path 
    }));
    const rawUrl = updatedData && updatedData.image ? String(updatedData.image).trim() : "";
    const normalizedUrl = rawUrl
        ? (/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`)
        : "";
    const textImage = normalizedUrl ? [{ filename: "listingimage", url: normalizedUrl }] : [];
    const incomingImages = [...uploadedImages, ...textImage];

    // Merge kept + incoming and limit to 3
    const merged = [...keptImages, ...incomingImages].slice(0,3);
    updatedData.images = merged;
    updatedData.image = merged[0] || null;

    await Listing.findByIdAndUpdate(id, updatedData);
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
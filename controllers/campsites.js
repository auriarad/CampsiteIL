const Campsite = require("../models/campsite");
const ObjectID = require('mongoose').Types.ObjectId;
const { regions, featuresList } = require('../public/data.js');
const { cloudinary } = require('../cloudinary')



module.exports.newForm = (req, res) => {
    res.render('campsites/new', { regions });
}

module.exports.show = async (req, res) => {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
        req.flash('error', 'מזהה חניון לא חוקי!')
        res.redirect('/campsites')
    }
    const campsite = await Campsite.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campsite) {
        req.flash('error', 'החניון לא נמצא :(')
        res.redirect('/campsites')
    }
    res.render('campsites/show', { campsite });
}

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const { title, description, geometry, region } = req.body.campsite;
    const newGeometry = { type: geometry.type, coordinates: geometry.coordinates.split(',') }
    let campsite = { title, description, geometry: newGeometry, region };
    if (req.body.campsite.features) campsite.features = req.body.campsite.features.split(",");
    const updatedCamp = await Campsite.findByIdAndUpdate(id, campsite, { runValidators: true });
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCamp.updateOne({ $pull: { imgs: { filename: { $in: req.body.deleteImages } } } })
    }
    res.redirect(`/campsites/${id}`);
}

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findByIdAndDelete(id);
    if (campsite.imgs.length) {
        for (let img of campsite.imgs) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
    req.flash('success', 'החניון נמחק בהצלחה!')
    res.redirect('/campsites');
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id);
    res.render('campsites/edit', { campsite, regions });
}

module.exports.index = async (req, res) => {
    const campsites = await Campsite.find({});
    res.render('campsites/index', { campsites, regions })
}

module.exports.create = async (req, res) => {
    const { title, description, geometry, region } = req.body.campsite;
    const newGeometry = { type: geometry.type, coordinates: geometry.coordinates.split(',') }
    const newCampsite = new Campsite({ title, description, geometry: newGeometry, region });
    newCampsite.author = req.user._id;
    newCampsite.imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    if (req.body.campsite.features) newCampsite.features = req.body.campsite.features.split(",");
    await newCampsite.save();
    req.flash('success', 'יצרת אתר קמפינג חדש!')
    res.redirect(`/campsites/${newCampsite._id}`);
}

module.exports.newImage = async (req, res) => {
    const { id } = req.params;
    newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const updated = await Campsite.findByIdAndUpdate(id, { $push: { imgs: { $each: newImages } } }, { runValidators: true, new: true });
    res.json({
        success: true,
        message: 'התמונה נוספה בהצלחה!',
        redirectUrl: `/campsites/${id}`
    });
}

module.exports.getApi = async (req, res) => {
    const isAjax = req.xhr || req.headers.accept?.includes('json');

    if (!isAjax) {
        req.flash('error', 'החניון לא נמצא :(')
        return res.redirect('/campsites')
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let search = (req.query.search);
    const filter = (req.query.filter);
    const selectedRegions = (req.query.regions);

    search = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const selectedRegionsArr = selectedRegions.split(',');
    const filterArr = filter.split(',');
    try {
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: `(^|\\s)${search}($|\\s)`, $options: 'i' } }
            ];
        }

        if (filter && filterArr.length > 0 && filterArr[0] !== '') {
            query.features = { $nin: filterArr };
        }

        if (selectedRegions && selectedRegionsArr.length > 0 && selectedRegionsArr[0] !== '') {
            query.region = { $in: selectedRegionsArr };
        }

        const campsites = await Campsite.find(query)
            .skip(skip)
            .limit(limit)
            .lean({ virtuals: true });

        const total = await Campsite.countDocuments(query);
        const hasMore = total > skip + campsites.length;

        res.json({
            campsites,
            featuresList,
            hasMore,
            currentPage: page
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

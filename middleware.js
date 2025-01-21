const ExpressError = require('./utils/ExpressError.js');
const Campsite = require('./models/campsite');
const { campsiteSchema, reviewSchema } = require('./schemas.js');
const wrapAsync = require('./utils/wrapAsync.js');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'בשביל פעולה זאת אתה צריך להיות מחובר!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampsite = (req, res, next) => {
    const { error } = campsiteSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message);
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message);
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isAuthor = wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campsite = await Campsite.findById(id);
    if (!campsite) {
        req.flash('error', 'החניון לא נמצא :(')
        return res.redirect('/campsites')
    }
    if (!campsite.author.equals(req.user._id)) {
        req.flash('error', 'אין לך רשות לעשות פעולה זאת')
        return res.redirect(`/campsites/${id}`);
    }
    next();
})

module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'התגובה לא נמצא :(')
        return res.redirect(`/campsites/${id}`)
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'אין לך רשות לעשות פעולה זאת')
        return res.redirect(`/campsites/${id}`);
    }
    next();
})

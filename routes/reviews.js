const express = require('express');
const router = express.Router({ mergeParams: true });

const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware.js');
const reviewController = require('../controllers/reviews.js')

router.post('/', isLoggedIn, validateReview, wrapAsync(reviewController.create))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewController.delete))

module.exports = router;
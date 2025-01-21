const express = require('express');
const router = express.Router();

const wrapAsync = require('../utils/wrapAsync.js');
const { isLoggedIn, isAuthor, validateCampsite } = require('../middleware.js');
const campController = require('../controllers/campsites.js')

const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })


router.route('/')
    .get(wrapAsync(campController.index))
    .post(isLoggedIn, upload.array('image'), validateCampsite, wrapAsync(campController.create))

router.get('/new', isLoggedIn, campController.newForm)

router.get('/api', campController.getApi);

router.route('/:id')
    .get(wrapAsync(campController.show))
    .put(isLoggedIn, isAuthor, validateCampsite, wrapAsync(campController.update))
    .delete(isLoggedIn, isAuthor, wrapAsync(campController.delete))

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campController.editForm))

router.post('/:id/photoUpload', isLoggedIn, isAuthor, upload.array('image'), (campController.newImage))

module.exports = router;
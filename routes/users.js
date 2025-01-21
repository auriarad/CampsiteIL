const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require('passport');
const { isLoggedIn, storeReturnTo } = require('../middleware.js');
const usersController = require('../controllers/users.js');

router.route('/register')
    .get(storeReturnTo, usersController.signUpForm)

    .post(storeReturnTo, wrapAsync(usersController.register))

router.route('/login')
    .get(storeReturnTo, usersController.signInForm)

    .post(storeReturnTo, passport.authenticate(
        'local', { failureFlash: true, failureRedirect: '/login' }),
        usersController.logIn)

router.post('/logout', isLoggedIn, usersController.logOut)

module.exports = router;
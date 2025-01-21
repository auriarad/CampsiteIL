const User = require('../models/user');

module.exports.signUpForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `איזה כיף שהצטרפת אלינו ${username}!`);
            const returnTo = res.locals.returnTo || '/campsites';
            res.redirect(returnTo);
        })
    } catch (e) {
        if (e.code === 11000) {
            if (Object.keys(e.keyValue)[0] === "email") {
                req.flash('error', 'אופס, זה נראה כאילו כבר יש מישהו במערכת עם המייל הזה');
            }
        } else {
            req.flash('error', e.message);
        }
        res.redirect('/register');
    }
}

module.exports.signInForm = (req, res) => {
    res.render('users/login')
}

module.exports.logIn = (req, res) => {
    req.flash('success', `שלום ${req.user.username}, התגעגנו!`);
    const returnTo = res.locals.returnTo || '/campsites';
    res.redirect(returnTo);
}

module.exports.logOut = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'ביי ביי (:');
        res.redirect('/campsites');
    })
}

//sectet stuff
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//configure express + ejs
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')));

//security shit
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
app.use(mongoSanitize({ replaceWith: '' }));
const scriptSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdnjs.cloudflare.com/",
];
const styleSrcUrls = [
    "https://api.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/dqvhkjjyh/",
];
const fontSrcUrls = [
    'https://fonts.googleapis.com/',
    'https://fonts.gstatic.com/'
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dqvhkjjyh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://pixabay.com/get/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//configure mongo
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/CampsiteIL'
const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
    try {
        await mongoose.connect(dbUrl);
        console.log("database connected!")
    } catch {
        console.log("oh no, could not connect to server")
    }
}

//session, cookies and flash
const session = require('express-session');
const MongoStore = require('connect-mongo');
const secret = process.env.SECRET
const sessionConfig = {
    name: "session",
    secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + (1000 * 60 * 60 * 24 * 14),
        maxAge: (1000 * 60 * 60 * 24 * 14)
    }
}

app.use(session(sessionConfig));


const flash = require('connect-flash');
app.use(flash());

//Auth
const User = require('./models/user.js')
const passport = require('passport');
const passportLocal = require('passport-local');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Error Handaling
const ExpressError = require('./utils/ExpressError.js');

//routes
//use by all
app.use((req, res, next) => {
    if (!['/login', '/', '/register', '/campsites/api'].includes(req.baseUrl + req.path) && req.method === 'GET') {
        req.session.returnTo = req.originalUrl;
    } else {
        if (!req.session.returnTo) req.session.returnTo = '/campsites';
    }
    res.locals.loggedUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//require routes
const campsitesRoutes = require('./routes/campsites.js')
app.use('/campsites', campsitesRoutes);

const reviewsRoutes = require('./routes/reviews.js');
app.use('/campsites/:id/reviews', reviewsRoutes);

const usersRoutes = require('./routes/users.js');
app.use('/', usersRoutes);

//errors routes
app.get('/', (req, res) => {
    res.redirect('/campsites');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('הדף לא נמצא', 404))
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'משהו השתבש :(' } = err;
    res.status(status).render('error', { message, status, stack: err.stack });
})

app.listen(3000, (req, res) => {
    console.log('port 3000 lets go!');
})
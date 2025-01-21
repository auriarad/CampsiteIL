const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'You must have an email'],
        unique: true
    }
})

const options = {
    errorMessages: {
        MissingPasswordError: 'היי, שכחת להכניס סיסמה!',
        AttemptTooSoonError: 'קצת סבלנות, החשבון נעול כרגע. נסה שוב עוד מעט',
        TooManyAttemptsError: 'נראה שניסית קצת יותר מדי... החשבון נעול כרגע',
        NoSaltValueStoredError: 'אופס, משהו חסר במערכת. לא הצלחנו לאמת אותך',
        IncorrectPasswordError: 'שם המשתמש או הסיסמה לא נכונים',
        IncorrectUsernameError: 'שם המשתמש או הסיסמה לא נכונים',
        MissingUsernameError: 'שכחת להכניס שם משתמש!',
        UserExistsError: 'אופס, כבר יש מישהו במערכת עם שם המשתמש הזה. נסה שם אחר'
    }
};

userSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', userSchema);
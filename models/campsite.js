const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { regions, featuresList } = require('../public/data.js');
const Review = require('./review.js');

const ImageSchema = new Schema({
    url: String,
    filename: String

})

const opts = {
    weights: { title: 10, description: 1 },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
};

const CampsiteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
        enum: regions
    },
    geometry: {
        type: {
            type: String,
            enum: ['point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    imgs: [ImageSchema],

    features: {
        type: [String],
        default: [],
        enum: featuresList
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampsiteSchema.virtual('properties').get(function () {
    return {
        id: this._id,
        title: this.title,
        features: this.features,
        featuresList
    }
});

CampsiteSchema.virtual('featuresList').get(function () {
    return featuresList;
});



ImageSchema.virtual('thumb').get(function () {
    return this.url.replace('/upload', '/upload/w_200').replace('_640', '_340');
})


CampsiteSchema.post('findOneAndDelete', async function (campsite) {
    if (campsite.reviews.length) {
        await Review.deleteMany({ _id: { $in: campsite.reviews } })
    }
})

const Campsite = mongoose.model('Campsite', CampsiteSchema);
module.exports = Campsite;
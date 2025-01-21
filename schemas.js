const baseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//no html validte
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'מנסה לשחק אותה האקר אה'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedAttributes: {},
                    allowedTags: []
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value });
                return clean;
            }
        }
    }
});
const Joi = baseJoi.extend(extension);

//campsite validate schema
module.exports.campsiteSchema = Joi.object({
    campsite: Joi.object({

        title: Joi.string()
            .required()
            .escapeHTML()
            .messages({
                'string.empty': 'כותרת חובה',
                'any.required': 'שדה כותרת הוא חובה'
            }),

        description: Joi.string()
            .required()
            .escapeHTML()
            .messages({
                'string.empty': 'תיאור הוא חובה',
                'any.required': 'שדה תיאור הוא חובה'
            }),

        region: Joi.string()
            .valid('רמת הגולן',
                'אצבע הגליל',
                'גליל עליון',
                'גליל תחתון',
                'גליל מערבי',
                'כרמל והסביבה',
                'חברון',
                'בקעת הירדן',
                'השרון',
                'איזור הרי בית אל',
                'גוש עציון והר חברון',
                'מרכז',
                'מישור החוף הדרומי',
                'ירושלים והרי יהודה',
                'צפון מדבר יהודה',
                'ים המלח ומדבר יהודה',
                'שפלה',
                'נגב צפוני',
                'נגב מרכז ודרום',
                'הערבה',
                'אילת והסביבה'
            )
            .required()
            .messages({
                'any.only': 'האזור חייב להיות אחד מהערכים המותרים',
                'string.empty': 'שדה אזור הוא חובה',
                'any.required': 'שדה אזור הוא חובה'
            }),

        geometry: Joi.object({
            type: Joi.string()
                .valid(
                    'point',
                )
                .required(),

            coordinates: Joi.any()
                .required(),
        }).required()
            .messages({
                'any.required': 'מיקום הוא חובה'
            })
        ,

        features: Joi.any()
        ,
    }).required()
        .messages({
            'any.required': 'שדה אתר קמפינג הוא חובה'
        }),
    deleteImages: Joi.array()
});


//reviews validation schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(0).max(5).required()
            .messages({
                'number.base': 'הדירוג חייב להיות מספר',
                'number.min': 'הדירוג חייב להיות לפחות 0',
                'number.max': 'הדירוג לא יכול להיות גבוה מ-5',
                'any.required': 'שדה דירוג הוא חובה'
            }),
        body: Joi.string().required().escapeHTML()
            .messages({
                'string.empty': 'שדה ביקורת הוא חובה',
                'any.required': 'שדה ביקורת הוא חובה'
            })
    }).required().messages({
        'any.required': 'שדה ביקורת הוא חובה'
    })
});

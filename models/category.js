const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
    {
        name: {type: String, required: true}, //add minlength, maxlength? etc?
        description:  {type: String, required: true},
    }
);

CategorySchema
.virtual('url')
.get(function() {
    return `/inventory/category/${this._id}`}); //maybe change to something else

module.exports = mongoose.model('Category', CategorySchema)
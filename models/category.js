var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
    {
        name: {type: String, required: true}, //add minlength, maxlength? etc?
        description:  {type: String, required: true},
    }
);

CategorySchema
.virtual('url')
.get(() => `/category/${this._id}`); //maybe change to something else

module.exports = mongoose.model('Category', CategorySchema)
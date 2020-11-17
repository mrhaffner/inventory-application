var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        name: {type: String, required: true}, //add minlength, maxlength? etc?
        description:  {type: String, required: true},
        category: {type: Schema.Types.ObjectId, ref: 'Category'}, //, required: true ??????
        price: {type: Number, rquired: true}, //??
        stock: {type: Number, rquired: true}, //??
    }
);

ItemSchema
.virtual('url')
.get(() => `/category/item/${this._id}`); //maybe change to something else

module.exports = mongoose.model('Item', ItemSchema)
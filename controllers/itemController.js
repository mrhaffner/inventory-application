const { body,validationResult } = require('express-validator');
const Item = require('../models/item');
const Category = require('../models/category');

const async = require('async');

exports.index = function(req, res) {
    async.parallel({
        item_count: function(callback) {
            Item.countDocuments({}, callback)
        }, //might not need this counting crap if I'm not using it
        category_count: function(callback) {
            Category.countDocuments({}, callback)
        }
    }, function(err, results) {
        res.render('index', { title: 'Inventory Home', error: err, data: results}
    )} 
    );
};

// Display list of all items.
exports.item_list = function(req, res, next) {
    
    Item.find({}, 'name category') //this correct?
        .populate('category') //this correct?
        .exec(function(err, list_items) {
            if (err) { return next(err); } //probably can be decomposed or whatever the word is
            res.render('item_list', { title: 'Item List', item_list: list_items})
        })
};

// Display detail page for a specific item.
exports.item_detail = function(req, res, next) {

    Item.findById(req.params.id)
    .populate('category')
    .exec(function(err, item) {
        if (err) { return next(err); }
        if (item==null) {
            const err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }
        res.render('item_detail', { item: item } );
    })
};

// Display item create form on GET.
exports.item_create_get = function(req, res, next) {
    Category.find({}, 'name')
    .exec(function(err, categories) {
        if (err) {return next(err)}
        res.render('item_form', { title: 'Create Item', category_list: categories } )
    })
};

// Handle item create on POST.
exports.item_create_post = [

    // Validate and sanitise fields.
    body('category', 'Category must be specified').trim().isLength({ min: 1 }).escape(),
    body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must be specified').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape(),
    body('stock', 'Stock must be specified').trim().isLength({ min: 1 }).escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a item object with escaped and trimmed data.
        const item = new Item(
          { category: req.body.category,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Category.find({},'name')
                .exec(function (err, categories) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('item_form', { title: 'Create item', item_list: categories, selected_item: item.category._id , errors: errors.array(), item: item });
            });
            return;
        }
        else {
            // Data from form is valid.
            item.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(item.url);
                });
        }
    }
];

// Display item delete form on GET.
exports.item_delete_get = function(req, res, next) {
    Item.findById(req.params.id)
    .populate('category')
    .exec(function (err, item) {
        if (err) { return next(err); }
        if (item==null) {
            res.redirect('/inventory/items');
        }
        res.render('item_delete', { title: 'Delete Item', item: item });
    })
};

// Handle item delete on POST.
exports.item_delete_post = function(req, res, next) {
    Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
        if (err) { return next(err); }
        res.redirect('/inventory/items');
    })
};

// Display item update form on GET.
exports.item_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: item update GET');
};

// Handle item update on POST.
exports.item_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: item update POST');
};
const { body,validationResult } = require("express-validator");
const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');

// Display list of all categorys.
exports.category_list = function(req, res) {
    
    Category.find()
        .sort([['name', 'ascending']])
        .exec(function(err, list_categories) {
            if (err) { return next(err); } //probably can be decomposed or whatever the word is
            res.render('category_list', { title: 'Category List', category_list: list_categories });
        });
};

// Display detail page for a specific category.
exports.category_detail = function(req, res) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        category_items: function(callback) {
            Item.find({ 'category': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } //probably can be decomposed or whatever the word is
        if (results.category==null) {
            const err = new Error('Category not found');
            err.statuus = 404;
            return next(err);
        }
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_items: results.category_items} );
    });
};



// Display category create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category'})
}


// Handle Category create on POST.
exports.category_create_post =  [
   
    // Validate and santise the name field.
    body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description required').trim().isLength({ min: 1 }).escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a category object with escaped and trimmed data.
      var category = new Category(
        { name: req.body.name, description: req.body.description }
      );
  
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('category_form', { title: 'Create Category', category: category, errors: errors.array()});
        return;
      }
      else {
        // Data from form is valid.
        // Check if category with same name already exists.
        Category.findOne({ 'name': req.body.name })
          .exec( function(err, found_category) {
             if (err) { return next(err); }
  
             if (found_category) {
               // Category exists, redirect to its detail page.
               res.redirect(found_category.url);
             }
             else {
  
               category.save(function (err) {
                 if (err) { return next(err); }
                 // Category saved. Redirect to category detail page.
                 res.redirect(category.url);
               });
  
             }
  
           });
      }
    }
  ];

// Display category delete form on GET.
exports.category_delete_get = function(req, res, next) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id).exec(callback);
    },
    category_items: function(callback) {
      Item.find({ 'category': req.params.id}).exec(callback);
    },
  }, function(err, results) {
    if (err) {return next(err)}
    if (results.category==null) {
      res.redirect('/inventory/categories')
    }
    res.render('category_delete', {title: 'Delete Category', category: results.category, category_items: results.category_items } );
  });
};

// Handle category delete on POST.
exports.category_delete_post = function(req, res, next) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id).exec(callback);
    },
    category_items: function(callback) {
      Item.find({ 'category': req.params.id}).exec(callback);
    },
  }, function(err, results) {
    if (err) {return next(err)}
    if (results.category_items > 0) {
      res.render('category_delete', {title: 'Delete Category', category: results.category, category_items: results.category_items } );
      return;
    } else {
      Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
        if (err) { return next(err); }
        res.redirect('inventory/categories/')
      });
    }
  });
};

// Display category update form on GET.
exports.category_update_get = function(req, res, next) {
  Category.findById(req.params.id, function(err, category) {
    if (err) { return next(err); }
    if(category==null) {
      const err = new Error('Category not found');
      err.statuus = 404;
      return next(err);
    }
    res.render('category_form', { title: 'Update Category', category: category });
  });
};

// Handle category update on POST.
exports.category_update_post = [
   
  // Validate and santise the name field.
  body('name', 'Category name required').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description required').trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    var category = new Category(
      { 
        name: req.body.name, description: req.body.description,
        _id: req.params.id
      }
    );


    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('category_form', { title: 'Update Category', category: category, errors: errors.array()});
      return;
    }
    else {
      // Data from form is valid.
      // Check if category with same name already exists.
      Category.findByIdAndUpdate(req.params.id, category, {}, function (err, thecategory) {
        if (err) { return next(err); }
        res.redirect(thecategory.url)
      });
    }
  }
];
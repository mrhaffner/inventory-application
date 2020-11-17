#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
const Item = require('./models/item')
const Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const items = []
const categories = []

function itemCreate(name, description, category, price, stock, cb) {
  itemdetail = { name, description, price, stock }
  if (category != false) itemdetail.category = category

  const item = new Item(itemdetail);
  item.save((err) => {
    if (err) {
      cb(err, null)
      return;
    }
    console.log(`New Item: ${item}`);
    items.push(item)
    cb(null, item)
  });
}

function categoryCreate(name, description, cb) {
  const category = new Category({ name, description });
  category.save((err) => {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New Category: ${category}`);
    categories.push(category)
    cb(null, category);
  });
}

function createCategories(cb) {
  async.series([
    (callback) => categoryCreate('Hangboard', 'Strong Fingers, Strong Mind', callback),
    (callback) => categoryCreate('Chalk', 'The opposite of moisturizer', callback),
    (callback) => categoryCreate('Chalk Bags', "It's where you put your chalk", callback),
    (callback) => categoryCreate('Crash Pads', 'Aim required', callback),
  ],
  cb);
}

function createItems (cb) {
  async.parallel([
    (callback) => itemCreate('Rock Prodigy Training Center', `Based on the highly successful training routines of Mark and Mike Anderson, authors of “The rock Climber's Training Manual: A Guide to Continuous Improvement", the Rock Prodigy Training Center is designed for extremely precise and repeatable exercises. The two pieces allow you to fine-tune the position to match your body, and the computer engineered design yields perfectly symmetrical holds. The Anderson brothers went from average climbers to 5.14 crushers using finely tuned training regimens. This hangboard’s design is based on years of experimentation and refinement, and is the perfect tool to help climbers of all abilities progress to the next level.`, categories[0], 139.95, 0, callback),
    (callback) => itemCreate('Beastmaker 2000 Series', `The Beastmaker 2000 is not a hangboard for beginners, it has been designed with the input of some of the best climbers the UK has to offer. The result is a hangboard which tests the limits of finger strength and will help you towards your high grade goals. The beastmaker 2000 comprises of many holds which will let you specifically target your weaknesses and get stronger, comfortably, in all of the grip types. Every hold on the board has been well thought out and radiused in order to keep the chances of tweaking to a minimum and the wooden texture wont ruin your skin whilst being grippy enought not to be frustrating`, categories[0], 139.00, 15, callback),
    (callback) => itemCreate('Flash Board', `The Flash Board was born out of necessity. After travel induced lapses in training and many climbing sessions undermined by a lack of good warm-ups, we knew we needed a solution. The compact, cylindrical design makes the Flash Board light, easy to pack, adjustable, and extremely resistant to rotation. Hang it from a pull-up bar, a sturdy tree, a bolt, or pull against the resistance of a solid object or your own foot! This is one tool you don’t want to be without. Just don’t pack it in your carry-on luggage… the TSA doesn’t love that.`, categories[0], 85.00, 4, callback),
    (callback) => itemCreate('300G Loose White Gold Chalk', 'Pure, uncut and ready to rock.', categories[1], 13.95, 33, callback),
    (callback) => itemCreate('Super Chalk Sock', 'Great for reducing clouds of flying chalk at the gym or on your home mini-wall, the Super Chalk Sock is filled with Metolius Super Chalk.', categories[1], 3.95, 22, callback),
    (callback) => itemCreate('prAna Chalk Bag with Belt', 'Dip into this prAna chalk bag to keep your hands dry and grippy while working a route.', categories[2], 20.00, 4, callback),
    (callback) => itemCreate('Black Diamond Mojo Zip Chalk Bag', 'The Black Diamond Mojo Zip Chalk Bag features a rear zippered pocket that holds small essentials like your keys, a route topo or a smartphone.', categories[2], 22.95, 1, callback),
    (callback) => itemCreate('ORGANIC Climbing Lunch Bag Chalk Bucket', 'Handmade in the USA, the ORGANIC Climbing Lunch Bag Chalk Bucket is a one-of-a-kind chalk bag created by upcycling scrap materials from the cutting room. No two bags are alike.', categories[2], 33.00, 7, callback),
    (callback) => itemCreate('Metolius Session II Crash Pad', 'You move around while you work on boulder problems, so your pad should be easy to maneuver. The Metolius Session II crash pad has several updates to the previous version and still weighs only 9 lbs.', categories[3], 159.95, 2, callback),
    (callback) => itemCreate('ORGANIC CLimbing 4" Thick Big Pad', `The slightly smaller sibling to our Big Five. It features a 1050d ballistic nylon shell and 1000d Cordura nylon landing zone and folds closed to 29" x 46" x 8". The landing zone is fully customizable in your choice of background color and accent colors and is made one-of-a-kind from recycled cutting room scraps.`, categories[3], 299.00, 1, callback),
  ],
  cb);
}

async.series([
    createCategories,
    createItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Items: '+items);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});

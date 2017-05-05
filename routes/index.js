var express = require('express');
var router = express.Router();

// DB stuff
var mongo = require('mongodb');
var db    = require('monk')('localhost/nodeblog');

// Get index
router.get('/', function(req, res, next) {

  // Get db
  var db = req.db;
  var posts = db.get('posts');

  // Get posts stored in db
  posts.find({}, {}, function(err, posts){
    res.render('index', { posts: posts });
  });

});

module.exports = router;

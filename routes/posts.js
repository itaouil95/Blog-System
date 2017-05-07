var express = require('express');
var router = express.Router();

// File upload stuff
var multer = require('multer');
var upload = multer({ dest: './public/images/' });

// DB stuff
var mongo = require('mongodb');
var db    = require('monk')('localhost/nodeblog');

// Fetch specif post (by id)
router.get('/show/:id', function(req, res, next) {

  // Get db collection
  var db = req.db;
  var posts = db.get('posts');

  // Fetch data
  posts.findById(req.params.id, function(err, post) {
    res.render('show', {
      'post': post
    });
  });

});

// Renders Posts
router.get('/add', function(req, res, next) {

  // Get db collection
  var db = req.db;
  var categories = db.get('categories');

  // Fetch data
  categories.find({}, {}, function(err, categories) {
    res.render('addpost', {
      'title': 'Add Post',
      'categories': categories
    });
  });

});

// Adds Post to db
router.post('/add', upload.single('mainImage'), function(req, res, next) {

  // Get form values
  var title = req.body.title;
  var category = req.body.category;
  var body = req.body.body;
  var author = req.body.author;
  var date = new Date();

  // Check Image uploaded
  if (req.file) {
    var mainImage = req.file.filename;
  }
  else {
    var mainImage = 'noImage.jpg';
  }

  // Form validation
  req.checkBody('title', 'Title field is required.').notEmpty();
  req.checkBody('body', 'Body field is required.').notEmpty();

  // Check for validation errors
  var errors = req.validationErrors();
  if (errors) {
    res.render('addpost', { errors: errors});
  }
  else {
    // Insert into database
    var post = db.get('posts');
    post.insert({
      'title': title,
      'body': body,
      'category': category,
      'date': date,
      'author': author,
      'mainImage': mainImage
    }, function(err, post) {
      if (err) {
        res.send(err);
      }
      else {
        req.flash('success', 'Post Added');
        res.location('/');
        res.redirect('/');
      }
    });
  }

});

// Add comment
router.post('/addcomment', function(req, res, next) {

  // Get form values
  var postid = req.body.postid;
  var name = req.body.name;
  var email = req.body.email;
  var body = req.body.body;
  var commentDate = new Date();

  // Form validation
  req.checkBody('name', 'Name field is required.').notEmpty();
  req.checkBody('email', 'Email field is required.').notEmpty();
  req.checkBody('email', 'Email is not formatted properly.').isEmail();
  req.checkBody('body', 'Body field is required.').notEmpty();

  // Check for validation errors
  var errors = req.validationErrors();
  if (errors) {
    var posts = db.get('posts');
    post.findById(postid, function (err, post) {
      res.render('show', {
        post: post,
        errors: errors
      });
    });
  }
  else {
    var comment = {
      'name': name,
      'email': email,
      'body': body,
      'commentDate': commentDate
    }

    var posts = db.get('posts');

    // Add comment
    posts.update({
      '_id': postid
    }, {
      $push: {
        'comments': comment
      }
    }, function(err, doc) {
      if (err) {
        throw err;
      }
      else {
        req.flash('success', 'Comment added');
        res.location('/posts/show/' + postid);
        res.redirect('/posts/show/' + postid);
      }
    });
  }

});

module.exports = router;

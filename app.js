// Modules
var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var flash        = require('connect-flash');
var validator    = require('express-validator');
var session      = require('express-session');
var emessages    = require('express-messages');
var moment       = require('moment');
var mongo        = require('mongodb');
var db           = require('monk')('localhost/nodeblog');
var multer       = require('multer');
var upload       = multer({ dest: './uploads/' })

// Routes module
var index = require('./routes/index');
var posts = require('./routes/posts');

// Express instance
var app = express();

// Make moment global function
app.locals.moment = moment;

// View's rendering engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
  secret: 'I am not a secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Flash middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator middleware
app.use(validator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Make db (via monk ORM) accessible to router
app.use(function (req, res, next) {
  req.db = db;
  next();
});

// Routes middleware
app.use('/', index);
app.use('/posts', posts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

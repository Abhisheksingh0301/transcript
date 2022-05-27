var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose=require('mongoose');
// var dateFormat = require('dateformat');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Db connection
mongoose.Promise=global.Promise;
//mongoose.connect('mongodb://localhost:27017/school', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect('mongodb+srv://abhijeet_04:abhijeet_04@cluster0-fddt1.azure.mongodb.net/xavier?retryWrites=true&w=majority',{
  useNewUrlParser: true
, useUnifiedTopology: true
})

 .then(()=>console.log('Connection successful'))
 //.catch((err)=>console.error );
 .catch((err)=>console.log('Connection error') );




app.use('/index', indexRouter);
app.use('/', usersRouter);


app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

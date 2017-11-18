  const express = require('express');
  const app = express(); // Initiate Express Application
  const router = express.Router(); // Creates a new router object.
  const path = require('path');
  const favicon = require('serve-favicon');
  const logger = require('morgan');
  const cookieParser = require('cookie-parser');
  const bodyParser = require('body-parser');
  const validator=require('express-validator');
  const auth = require('./routes/auth');
  const task = require('./routes/task');
  const mongoose=require('mongoose');
  const config=require('./config/database');
  const cors=require('cors');

  // const app = express();
  // Database Connection
  mongoose.Promise = global.Promise;
  mongoose.connect(config.uri, (err) => {
      if (err) {
          console.log('Could NOT connect to database: ', err);
      } else {
          console.log('Connected to database: ' + config.db);
      }
  });
  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(cors({ origin: 'http://localhost:4200' }));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(validator());
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // connect the server to Angular 4 index.html
  /*app.get('*',(req,res) =>{
      res.sendFile(path.join(__dirname,'/public/index.html'));

  });*/

  app.use('/auth', auth);
  app.use('/task', task);
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    const err = new Error('Not Found');
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

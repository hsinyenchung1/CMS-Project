var express = require('express');
var bodyParser = require('body-parser');
var cookParser = require('cookie-parser');
var mongoose = require('mongoose');
var app = express();

//connect mongodb start
var mongodb_url = 'mongodb://cms_database:cms_database@ds213209.mlab.com:13209/cms_database';
mongoose.connect(mongodb_url);
mongoose.Promise = global.Promise
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
//connect mogodb end

// Define schema
var Schema = mongoose.Schema;

var SomeModelSchema = new Schema({
    country: String,
    pages: [
      {
        pageTitle: String, 
        messages: [
          {
            cmsKey : String, 
            cmsMessage : String
          } 
        ]
      }
    ]
});

// Compile model from schema
var SomeModel = mongoose.model('cms', SomeModelSchema );


app.get('/', function(req, res, next){
  SomeModel.find({}).then(function(data){
    console.log(data);
    res.send(data);
  });
});

var server = app.listen(8081, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})
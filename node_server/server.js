var express = require('express');
var bodyParser = require('body-parser');
var cookParser = require('cookie-parser');
var mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const PORT = '5000';
var app = express();

app.use(bodyParser.json());
//connect mongodb start
// Connection URL
const url ='mongodb://cms_database:cms_database@ds213209.mlab.com:13209/cms_database';

// Database Name
const dbName = 'cms_database';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  const db = client.db(dbName);
  client.close();
});

//connect mogodb end

app.post('/search', (req, res, next) => {
  
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");  
    const db = client.db(dbName);
    const response = findDocument(db, req, res, function(){
      client.close();
    })

  });
});

function findDocument(db, req, res, callback) {
  var country = req.body.country;
  var language = req.body.language;
  var pageName = req.body.pageName
  var cmsKey = req.body.cmsKey;

  const collection = db.collection('cms');
  collection.find({country: country, language : language, pageTitle : pageName }).toArray(function(err, docs){
    console.log(docs);
    if(docs && docs[0] && docs[0].content[cmsKey] && docs[0].content[cmsKey].cmsMessage){
      assert.equal(err, null);
      console.log("+++++++++++++Found Document+++++++++++++++");
      res.send({ 'cmsMessage' : docs[0].content[cmsKey].cmsMessage});
      callback(docs);
    }else if(docs && docs[0]){
      modifyDocument(db, res, country, language, pageName, cmsKey, docs[0], callback);
    }else {
      createDocument(db, res, country, language, pageName, cmsKey, callback);
    }
    
  });
}

function modifyDocument ( db, res, country, language, pageName, cmsKey, docs, callback){
  let newData = docs;
  let oldContent = docs.content;
  const placehoder = constructJSONData(cmsKey, language);
  const newContent = Object.assign({}, oldContent, placehoder);
  newData.content = newContent;
  const collection = db.collection('cms');
  collection.findOneAndUpdate({country: country, language : language, pageTitle : pageName }, { $set : { "content" : newContent } },{returnOriginal : false}, function(err, results) {
    console.log("+++++++++++++Modify Document+++++++++++++++");
    console.log(JSON.stringify(results));
    res.send({ 'cmsMessage' :  (language === 'en') ? results.value.content[cmsKey].cmsMessage : 'Content needs to insert in current language'});
    callback();
  });


}

function createDocument(db, res, country, language, pageName, cmsKey, callback) {

  const collection = db.collection('cms');
  const placeholder = constructJSONData(cmsKey, language);
  collection.insertOne({
    'country' : country,
    'language' : language,
    'pageTitle' : pageName,
    'content' : placeholder
  }, function(err, results) {
      console.log("+++++++++++++Create Document+++++++++++++");
      res.send({ 'cmsMessage' : (language === 'en') ? results.ops[0].content[cmsKey].cmsMessage : 'Content needs to insert in current language'});
      callback();
    }
  );
}

function constructJSONData(key, language){
  var value = {
    cmsMessage : (language === 'en') ? key : ""
  }

  var placeholder = {}
  placeholder[key] = value;
  return placeholder;
}

var server = app.listen(PORT, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})
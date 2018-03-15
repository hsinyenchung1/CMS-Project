var express = require('express');
var bodyParser = require('body-parser');
var cookParser = require('cookie-parser');
var mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var app = express();

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

app.get('/search', (req, res, next) => {
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
  
    const db = client.db(dbName);
    findDocument(db, function(){
      client.close();
    })
  });
});

function findDocument(db, callback) {

  var country = 'us';
  var language = 'en'
  var pageName = 'testPage';
  var cmsKey = 'asdf';

  const collection = db.collection('cms');
  collection.find({country: country, language : language, pageTitle : pageName }).toArray(function(err, docs){
    console.log(docs);
    if(docs && docs[0] && docs[0].content[cmsKey] && docs[0].content[cmsKey].cmsMessage){
      assert.equal(err, null);
      callback(docs);
    }else if(docs && docs[0]){
      console.log("no page find ");
      motifyDocument(db, country, language, pageName, cmsKey, docs[0], callback);
    }else {
      createDocument(db, country, language, pageName, cmsKey, callback);
    }
    
  });
}
function motifyDocument ( db, country, language, pageName, cmsKey, docs, callback){
  let newData = docs;
  let oldContent = docs.content;
  const placehoder = constructJSONData(cmsKey, language);
  const newContent = Object.assign({}, oldContent, placehoder);
  newData.content = newContent;
  const collection = db.collection('cms');
  collection.findOneAndUpdate({country: country, language : language, pageTitle : pageName }, { $set : { "content" : newContent } }, function(err, results) {
    console.log(results);
    callback();
  });

}

function createDocument(db, country, language, pageName, cmsKey, callback) {

  const collection = db.collection('cms');
  const placeholder = constructJSONData(cmsKey, language);
  collection.insert({
    'country' : country,
    'language' : language,
    'pageTitle' : pageName,
    'content' : placeholder
  },function(err, results) {
      console.log("Collection created.");
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


app.get('/', function(req, res, next){

  var promiseSearchCountryFromDB = new Promise((resolve, reject) => {
    searchCountryModelFromDB(CountryModel, 'welcome', 'homePage', 'en', 'us', resolve, reject);
  });

  var promiseSaveNewCountryModeToDB = new Promise (( resolve, reject) => {
    saveNewCountryModeToDB (CountryModel, 'welcome', 'testPage', 'es', 'us', resolve, reject)
  });

  promiseSearchCountryFromDB.then(function(searchCountryresponse) {
    if(searchCountryresponse.found){
      console.log('+++++++++API GET SEARCH FOUND+++++++++');
      res.send(searchCountryresponse.cmsMessage);
    }else{
      console.log('+++++++++API GET SEARCH NOT FOUND+++++++++');
      promiseSaveNewCountryModeToDB.then((response) => {
        console.log('+++++++++API GET CREATEED+++++++++');
        console.log(response);
        res.send("save success");
      }).catch(
        (error) => {
          console.log(error);
          res.send("save fail llalal");
        }
      );
    }
  }).catch(
    (error) => {
      console.log(error);
      res.send("Invlid input");
    }
  );
  
});

function saveNewCountryModeToDB(CountryModel, cmsKey, pageName, language, country, resolve, reject){
  console.log('+++++++++saveNewCountryModeToDB START+++++++++');
  CountryModel.findOneAndUpdate({
    country : country,
    language : language, 
    'pages.pageTitle' : pageName
  }, {
    '$push' : {
      'pages.$.messages' : {
        "cmsKey": cmsKey,
        "cmsMessage": (language === 'en') ? cmsKey : ''
      }
    }
  }, {
    new : true
  }, (err, resultModel) => {
    if (err) {
      console.log("++++++++++ERROR FROM UPDATE++++++++++++");
      reject(err);
    }

    if(resultModel === null){
      // can not find the conent, we need to create one
      CountryModel.findOneAndUpdate({
        country : country,
        language : language,
      }, {
        country :  country,
        language : language,
        '$push' : {
          'pages.pageTite' : pageName
        }
      }, {
        new : true
      }, (err, data) => {
        console.log(data);
        if(data === undefined){
          CountryModel.save()
        }
      })
    }else{
      resolve("update success");
    }
  })
}



function searchCountryModelFromDB(CountryModel, cmsKey, pageName, language, country, resolve, reject){
  console.log("++++++++searchCountryModelFromDB START++++++++");
  CountryModel.
    findOne({
      'country' : country, 
      'language' : language,
      'pageTitle' : pageName, 
      'content' : {
        cmsKey
      }
    }, '').exec(function(err, searchResult){
      var result = {};
      if(err !== null && err !== undefined){
        console.log(err);
        console.log("++++++++searchCountryModelFromDB ERROR++++++++");
        reject(err);
      }else if ( searchResult !== null && searchResult !== undefined){
        console.log("++++++++searchCountryModelFromDB COUNTRY FOUND++++++++");
        result['found'] = true;
        console.log(JSON.stringify(searchResult));
        result['cmsMessage'] = searchResult;
        resolve(result);
      }
      // else if( searchResult === null || searchResult === undefined){
      //   console.log("++++++++searchCountryModelFromDB COUNTRY NOT FOUND++++++++");
      //   resolve(false);
      // }
    });
    
}

var server = app.listen(8081, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})
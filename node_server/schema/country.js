var mongoose = require('mongoose');

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
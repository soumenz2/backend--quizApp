const mongoose = require('mongoose');
const optionSchema = new mongoose.Schema({
    optionID:{
      type:String,
      required:true,
      unique:true
    },
    questionID: {
        type: String,
        required: true
    },
  
    text: {
        type: String,
        
    },
 
    imageURL: {
        type: String,
        
    },

   isCorrect: {
        type: Boolean,
        required:true,
        
    },
    noOfOpted: {
        type: Number,
        required:true,        
    },

   

});

module.exports = mongoose.model('Option', optionSchema);
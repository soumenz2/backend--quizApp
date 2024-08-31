const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    questionID:{
      type:String,
      required:true,
      unique:true
    },
    quizID: {
        type: String,
        required: true
    },
  
    questionName: {
        type: String,
        required: true,
    },
 
    questionType: {
        type: String,
        required: true,
    },
    selectedOption:{
        type: String,
        required: true,
    },
    NoOfImpression: {
        type: Number,
        required:true,
        
    },

    correctlyAnswered: {
        type: Number,
        required:true,
        
    },
    wronglyAnswered: {
        type: Number,
        required:true,
        
    },
    timer: {
        type: Number,
        required:true,        
    },
   

});

module.exports = mongoose.model('Question', questionSchema);
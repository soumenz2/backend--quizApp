const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    quizID: {
        type: String,
        required: true,
        unique:true
    },
    userID: {
        type: String,
        required: true,
    },
    quizName: {
        type: String,
        required: true,
    },
 
    quizType: {
        type: String,
        required: true,
    },

    NoOfImpression: {
        type: Number,
        required:true,
        
    },
    DateOfCreation:{
        type:Date,
        required:true

    }

});

module.exports = mongoose.model('Quiz', quizSchema);
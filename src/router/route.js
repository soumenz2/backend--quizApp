const express=require('express')
const Router = express.Router; 
const verifyToken=require('../middleware/token.validation.js')
const validateRegisterUser=require('../middleware/register.validation.js')
const {
  signup,
  login,
  getUserDetails,
  createquiz,
  getQuizDetailsAdmin,
  createQuizWithQuestions,
  getQuestionsByQuizID,
  getQuestionsforUser,
  getQuizWithDetails,
  deleteQuiz,
  incrementImpression,
  checkIfOptionIsCorrect,
  getQuizDetails,
  updateWQuizDetails
} = require("../controller/authController.js");
const {body}=require('express-validator')
const authRouter=Router();

authRouter.post('/signup',validateRegisterUser,signup);
authRouter.post('/login',login);
authRouter.post('/setquiz',createquiz);
authRouter.get('/getuser',verifyToken,getUserDetails);
authRouter.get('/getquiz',getQuizDetailsAdmin);
authRouter.post('/setquestion',createQuizWithQuestions);
authRouter.get('/getquestion',getQuestionsByQuizID);
authRouter.get('/getquestionfoUser',getQuestionsforUser);
authRouter.get('/getQuizWithDetails',getQuizWithDetails);
authRouter.get('/getQuizDetails',getQuizDetails);
authRouter.post('/updatequiz',updateWQuizDetails);
authRouter.delete('/deleteQuiz', deleteQuiz);
authRouter.post('/checkOption',checkIfOptionIsCorrect);
authRouter.post('/incrementImpression',incrementImpression);


//export default authRouter;
module.exports=authRouter
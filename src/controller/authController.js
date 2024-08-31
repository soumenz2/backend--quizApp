const UserModel=require('../model/userModel.js')
const QuizModel=require('../model/quizModel.js')
const Question = require('../model/questionModel.js');
const Option = require('../model/optionModel.js');
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken');
const { randomUUID } =require('crypto');
const mongoose = require('mongoose');

const { validationResult }=require('express-validator');
const config = require('../config.js');

const signup=async(req,res)=>{
    try{
        const error=validationResult(req)
        if(!error.isEmpty()){
           return res.status(400).send({msg:error.array()})
        } 
        console.log("entered try block")
        const {name,email,password,confirmPassword }=req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ msg: "Passwords do not match" });
        }
        const existingUser=await UserModel.findOne({email})
        if(existingUser){
           return res.status(401).json({
            success:false,
            message:"User Allready Exist"
        })
        }else{
            console.log('Received data:', {name,email,password });
            const salt=bcrypt.genSaltSync(10);
            const hashpassword=bcrypt.hashSync(password,salt)
            const newUser=new UserModel({
                userID: randomUUID(),
                name:name,
                email:email,
                password:hashpassword

    
            })
            await newUser.save()
            return res.status(200).json({
                success:true,
                message:"Registration Done Successfully",
                data:res.data
            });
            
        }

    
    } 
    catch(error){
        console.log("sign up Issue")
        if (!res.headersSent) {  // Check if headers have been sent
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        } else {
            console.error("Headers already sent. Cannot send additional response.");
        }
    }

}
const login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        console.log("entered try block")
        const existingData= await UserModel.findOne({email})
        console.log(existingData)
        if(existingData){
            const passwordMatch= await bcrypt.compare(password,existingData.password)
            if(!passwordMatch){
                res.status(401).send({msg:"Password is wrong"})
            }
            const token=jwt.sign({_id:existingData.userID},config.secret,{ expiresIn: '1h' })
            res.status(200).send({
                msg:"Login Sucessfully",
                token
            })

        }
        else{
            res.status(404).send({msg:"Yoor Account is not Registered "})
        }

    }
    catch(error){
        res.status(501).send({msg:error.message})

    }

}
const getUserDetails=async(req,res)=>{
    const {userID}=req.body;
    try{
        const users = await UserModel.find({userID}); 
        res.status(200).send({
            msg:"Success",
            data:users
        })
        
    }
    catch(error){
        res.status(501).send({msg:error.message})
    }
   
}

const createquiz=async(req,res)=>{
    try{
        const error=validationResult(req)
        if(!error.isEmpty()){
           return res.status(400).send({msg:error.array()})
        } 
        console.log("entered try block")
        const {userID,quizName,quizType}=req.body;
            console.log('Received data:', {userID,quizName,quizType });
            const newQuiz=new QuizModel({
                quizID:randomUUID(),
                userID: userID,
                quizName:quizName,
                quizType:quizType,
                NoOfImpression:0,
                DateOfCreation:Date.now()

    
            })
            await newQuiz.save()
            return res.status(200).json({
                success:true,
                message:"Quiz Created Sucessfuilly",
                data:res.data
            });  
    } 
    catch(error){
        console.log("Quiz creation issue Issue")
        return res.status(500).json({
            success: false,
            message: error.message
        });
        
    }

}

const getQuizDetailsAdmin=async(req,res)=>{
    const {userID}=req.body;
    try{
        const quizDetails = await QuizModel.find({userID});
        if(!quizDetails.length){
            return res.status(404).json({ message: 'No quiz found for this user ID.' });
        }
        res.status(200).send({
            msg:"Success",
            data:quizDetails
        })
        
    }
    catch(error){
        res.status(501).send({msg:error.message})
    }
   
}
const createQuizWithQuestions = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userID, quizName, quizType, questions } = req.body;

        if (!userID || !quizName || !quizType || !questions || !Array.isArray(questions)) {
            throw new Error("Missing required fields or questions array is not valid");
        }

        
        if (questions.length > 5) {
            throw new Error("A quiz cannot have more than 5 questions.");
        }

      
        const newQuiz = new QuizModel({
            quizID: randomUUID(),
            userID,
            quizName,
            quizType,
            NoOfImpression: 0,
            DateOfCreation: Date.now(),
        });
        await newQuiz.save({ session });

        const createdQuestions = [];
        for (let questionData of questions) {
            const { questionName,selectedOption,  timer, options } = questionData;

            if (!questionName || !selectedOption || !options || !Array.isArray(options)) {
                throw new Error("Missing required fields in one of the questions or options array is not valid");
            }

            const questionID = randomUUID();
            const newQuestion = new Question({
                questionID,
                quizID: newQuiz.quizID,
                questionName,
                questionType:newQuiz.quizType,
                selectedOption,
                NoOfImpression:0,
                correctlyAnswered: 0,
                wronglyAnswered: 0,
                timer,
            });
            await newQuestion.save({ session });

            const newOptions = options.map((option) => new Option({
                optionID: randomUUID(),
                questionID,
                text: option.text,
                imageURL: option.imageURL,
                isCorrect: option.isCorrect,
                noOfOpted: 0,
            }));
            await Option.insertMany(newOptions, { session });

            createdQuestions.push({
                ...newQuestion.toObject(),
                options: newOptions.map(opt => opt.toObject())
            });
        }

        await session.commitTransaction();

        const quizWithQuestions = {
            quiz: newQuiz.toObject(),
            questions: createdQuestions
        };

        res.status(201).json({ message: 'Quiz and questions created successfully!', data: quizWithQuestions });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
};


const getQuestionsByQuizID = async (req, res) => {
    try {
       // const { quizID } = req.body;
        const { quizID } = req.query;
        
        const quiz=await QuizModel.findOne({quizID})
        // Find all questions with the given quizID
        const questions = await Question.find({ quizID });

        if (!questions.length) {
            return res.status(404).json({ message: 'No questions found for this quiz ID.' });
        }

        // Fetch the associated options for each question
        const questionsWithOptions = await Promise.all(
            questions.map(async (question) => {
                const options = await Option.find({ questionID: question.questionID });
                return { ...question.toObject(), options };
            })
        );

        res.status(200).json({ questions: questionsWithOptions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getQuestionsforUser= async (req, res) => {
    try {
        //const { quizID } = req.body;
        const { quizID } = req.query;

        // Find all questions with the given quizID
        const quiz=await QuizModel.findOne({quizID});
        quiz.NoOfImpression +=1;
        await quiz.save();
        const questions = await Question.find({ quizID });

        if (!questions.length) {
            return res.status(404).json({ message: 'No questions found for this quiz ID.' });
        }

        // Fetch the associated options for each question
        const questionsWithOptions = await Promise.all(
            questions.map(async (question) => {
                const options = await Option.find({ questionID: question.questionID });
                const sanitizedOptions = options.map((opt) => ({
                    optionID: opt.optionID,
                    text: opt.text,
                    imageURL: opt.imageURL,
                    noOfOpted:opt.noOfOpted
                }));
                return { ...question.toObject(), option:sanitizedOptions };
            })
        );

        res.status(200).json({ questions: questionsWithOptions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getQuizWithDetails = async (req, res) => {
    const { userID } = req.query

    try {
        // Fetch all quizzes associated with the userID
        const quizzes = await QuizModel.find({ userID });
        

        if (!quizzes.length) {
            return res.status(404).json({ message: 'No quiz found for this user ID.' });
        }
        let totalQuestions = 0;
        let totalImpressions = 0;

        // Fetch all questions and their options for each quiz
        const quizzesWithDetails = await Promise.all(
            quizzes.map(async (quiz) => {
                const questions = await Question.find({ quizID: quiz.quizID});
                totalQuestions += questions.length;
                totalImpressions += quiz.NoOfImpression;

                const questionsWithOptions = await Promise.all(
                    questions.map(async (question) => {
                        const options = await Option.find({ questionID: question.questionID });
                        return { ...question.toObject(), options };
                    })
                );

                return { ...quiz.toObject(), questions: questionsWithOptions };
            })
        );
        const totalQuizzes = quizzes.length;

        res.status(200).json({
            message: "Success",
            data: quizzesWithDetails,
            totalQuizzes,
            totalQuestions,
            totalImpressions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteQuiz = async (req, res) => {
    const { quizID } = req.query;

    try {
        // Find the quiz by ID and delete it
        const deletedQuiz = await QuizModel.findOneAndDelete({ quizID });

        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        const questionsToDelete = await Question.find({ quizID });

        if (questionsToDelete.length > 0) {
            // Extract the question IDs
            const questionIDs = questionsToDelete.map(question => question.questionID);

            // Delete all questions associated with the quiz
            await Question.deleteMany({ quizID });

            // If options are stored separately and need to be deleted
            await Option.deleteMany({ questionID: { $in: questionIDs } });
        }
        res.status(200).json({ 
            message: 'Quiz and its corresponding questions and options were successfully deleted.' 
        });

    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'An error occurred while deleting the quiz.' });
    }
};

const incrementImpression = async (req, res) => {
   
    try {
      const { questionID } = req.body;

      const question = await Question.findOne({ questionID });
  
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      question.NoOfImpression += 1;
      
      await question.save();
  
      return res.status(200).json({ message: 'Impression count incremented successfully', question });
    } catch (error) {
      console.error('Error incrementing impression count:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

const checkIfOptionIsCorrect = async (req, res) => {
    const { optionID } = req.body;
  
    try {
     
      const selectedOption =await Option.findOne({optionID});
      const questionID=selectedOption.questionID
      const question= await Question.findOne({questionID })
  
      if (!selectedOption) {
        return res.status(404).json({ message: 'Option not found.' });
      }
      console.log('Before update:', question.correctlyAnswered, question.wronglyAnswered);
      if (selectedOption.isCorrect) {
        question.correctlyAnswered += 1;
      } else {
        question.wronglyAnswered += 1;
      }
      await question.save()
      console.log('After update:', question.correctlyAnswered, question.wronglyAnswered);
  

  
      if (selectedOption.isCorrect) {
        return res.status(200).json({ message: 'Correct answer!'});
      } else {
        return res.status(200).json({ message: 'Wrong answer.'});
      }
    } catch (error) {
      console.error('Error checking option:', error);
      res.status(500).json({ message: 'An error occurred while checking the option.' });
    }
  };

  const getQuizDetails = async (req, res) => {
    const { quizID } = req.query;

    try {
        const quiz = await QuizModel.findOne({ quizID });

        if (!quiz) {
            return res.status(404).json({ message: 'No quiz found' });
        }

        const questions = await Question.find({ quizID: quiz.quizID });

        const questionsWithOptions = await Promise.all(
            questions.map(async (question) => {
                const options = await Option.find({ questionID: question.questionID });
                return { ...question.toObject(), options };
            })
        );

        const quizWithDetails = { ...quiz.toObject(), questions: questionsWithOptions };

        res.status(200).json({
            message: "Success",
            data: quizWithDetails,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 const updateWQuizDetails=async (req,res)=>{
   const  {quizData}=req.body;
   try {
    for (const question of quizData.questions) {
        let questionData = await Question.findOne({ questionID: question.questionID });

        if (questionData) {
            questionData.questionName = question.questionName;
            questionData.timer = question.timer;
            // Iterate through options and update each one
            for (const option of question.options) {
                let optionData = await Option.findOne({ optionID: option.optionID });

                if (optionData) {
                    optionData.text = option.text;
                    optionData.imageURL = option.imageURL;
                    optionData.isCorrect = option.isCorrect;
                    await optionData.save();
                }
            }

            await questionData.save();
        }
    }

    res.status(200).json({ message: 'Quiz details updated successfully.' });
} catch (error) {
    console.error('Error updating quiz details:', error);
    res.status(500).json({ message: 'Failed to update quiz details.' });
}
};
   

module.exports = {
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
};

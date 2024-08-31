const express=require('express')
const bodyparser=require('body-parser')
const authRouter=require('./router/route.js')
//import express from 'express'
//import bodyparser from 'body-parser'
//import authRouter from './router/route.js'
const app=express()
const cors = require('cors');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
  }));
  app.use(cors({
    origin: ['http://localhost:3000', 'https://quiz-app-chi-seven-28.vercel.app'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
  }));

  app.use('/api',authRouter)

  module.exports=app
//export default app

const config=require('./src/config')
const app=require('./src/app.js')
//import app from './src/app.js';


const mongoose=require('mongoose')

  const PORT =  config.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on localhost:${PORT}`)
    mongoose.connect(config.db)

})

;
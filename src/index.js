const express = require('express');
const database = require('./db/database');
const loginRouter = require('./router/loginRouter');
const tasksRouter = require('./router/tasksRouter');

const app = express();

const port = process.env.PORT;
app.use(express.json())
app.use(loginRouter)
app.use(tasksRouter)

app.listen(port,()=>{
    console.log(`listen on port ${port}`)
})


const express = require("express");
require('./db/mongoose')
const userRouter = require('./routers/userRouters')
const taskRouter = require('./routers/taskRouter')
const app = express()

app.use(express.json()) //It parses incoming requests with JSON payloads.
app.use(userRouter)
app.use(taskRouter)
const port = process.env.PORT
app.listen(port, () => {
    console.log("Server is up and running on port : " + port)
})
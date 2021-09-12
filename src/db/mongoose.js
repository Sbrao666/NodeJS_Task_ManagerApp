const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    // useCreateIndex: true
})

const mongoose = require('mongoose');

const database = mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true
})

module.exports = database;
const mongoose = require('mongoose')

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost/bungaa')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB', err))

const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const reviewSchema = new mongoose.Schema(
  {
    bungalov: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bungalov',
      autopopulate: {
        maxDepth: 1,
      },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: {
        maxDepth: 1,
      },
    },
  },
  {
    timestamps: true,
  }
)

class Review {}

reviewSchema.loadClass(Review)
reviewSchema.plugin(autopopulate)
module.exports = mongoose.model('Review', reviewSchema)

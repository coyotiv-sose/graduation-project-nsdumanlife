require('dotenv').config()

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
const passport = require('passport')

require('./database-connection')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const bungalovsRouter = require('./routes/bungalovs')
const bookingsRouter = require('./routes/bookings')
const reviewsRouter = require('./routes/reviews')
const accountsRouter = require('./routes/accounts')

// requires the model with Passport-Local Mongoose plugged in
const User = require('./models/user')

const secret = process.env.SECRET || 'thisshouldbeabettersecret'
const validateSecret = process.env.VALIDATE_SECRET || 'thisshouldbeabettersecret'

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy())

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

const app = express()

app.set('trust proxy', 1)

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const clientPromise = mongoose.connection.asPromise().then(connection => (connection = connection.getClient()))

app.use(
  session({
    secret: [secret, validateSecret],
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 15, // 15 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
    store: MongoStore.create({ clientPromise, stringify: false }),
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  const numberOfVisits = req.session.numberOfVisits || 0
  req.session.numberOfVisits = numberOfVisits + 1

  req.session.history = req.session.history || []
  req.session.history.push({ url: req.url, ip: req.ip })

  // console.log('Session: ', req.session)

  next()
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/bungalovs', bungalovsRouter)
app.use('/bookings', bookingsRouter)
app.use('/reviews', reviewsRouter)
app.use('/accounts', accountsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send({ error: err })
})

module.exports = app

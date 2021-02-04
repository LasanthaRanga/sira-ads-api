const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const port = process.env.PORT || 3000;
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catRouter = require('./routes/cat');
const addRouter = require('./routes/add');
const addUpRouter = require('./routes/addUpload');
const catUpRouter = require('./routes/catUpload');


const app = express();

// view engine setup


const allowedOrigins = [
  '*',
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost',
  'http://localhost:4100',
  'http://localhost:4200',
  'http://localhost:8080',
  'http://localhost:8100',
  'https://test.probox.lk',
  'https://testing.probox.lk',
  'http://supbox.lk',
  'https://supbox.lk',
  'https://probox.lk',
  'http://probox.lk',
  'http://kumi.lk',
  'https://kumi.lk',
  'https://adv.codetechasia.com',

];

// Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  }
}

// Enable preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cat', catRouter);
app.use('/add', addRouter);
app.use('/addUp', addUpRouter);
app.use('/catUp', catUpRouter);


app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  console.log(error.message);
  next(error);
});



app.get('/', cors(corsOptions), (req, res, next) => {
  res.json({ message: 'This route is CORS-enabled for an allowed origin.' });
})


app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
});

app.listen(port);
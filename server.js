require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const data = require('./movies-data-small.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

function validateAuthorization(req, res, next) {
  const API_TOKEN = process.env.API_TOKEN;
  const authValue = req.get('Authorization');

  if (authValue === undefined) {
    return res.status(400).json({ error: 'Authorization header missing' });
  }
  
  // change authValue to lowercase for case insensitivity
  else if (!authValue.toLowerCase().includes('bearer ')) {
    return res.status(400).json({ error: 'Invalid Authorization, must use Bearer strategy.' });
  }

  // isolate token from authValue
  else if (authValue.split(' ')[1] !== API_TOKEN) {
    return res.status(401).json({ error: ' Invalid credentials' });
  }

  next();
}

function getMovie(req, res) {

  let movies = [...data];
  const searchFields = ['genre', 'country', 'avg_vote'];

  Object.keys(req.query).forEach(key => {

    // change values to lowercase for case insensitivity
    let field = key.toLowerCase();
    let value = req.query[key].toLowerCase();

    // check that search field is allowed
    if (!searchFields.includes(field)) {
      return res.status(400).json({ error: `Search by '${field}' not allowed. Must be one of ${searchFields.join(', ')}` });
    }

    // handle different filters
    if (key === 'avg_vote') {
      movies = movies.filter(movie => movie[field] >= value);
    } else {
      movies = movies.filter(movie => movie[field].toLowerCase().includes(value));
    }

  });

  return res.status(200).json(movies);

}

app.get('/', (req, res) => res.send('Hello world!'));
app.get('/movie', validateAuthorization, getMovie);

// error handling
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }};
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT);
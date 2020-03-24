
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const data = require('./movies-data-small.json');

const API_TOKEN = process.env.API_TOKEN;

const app = express();
app.use(morgan('dev'));

function getMovie(req, res) {
  
  let movies = [...data];
  const searchFields = ['genre', 'country', 'avg_vote'];

  Object.keys(req.query).forEach(key => {

    // change values to lowercase for case insensitivity
    let field = key.toLowerCase();
    let value = req.query[key];

    // check that search field is allowed
    if (!searchFields.includes(field)) {
      return res.status(400).json({ error: `Search by '${field}' not allowed. Must be one of [${searchFields}]` })
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

app.get('/movie', getMovie);

app.listen('8080', () => console.log('Server live on :8080'));
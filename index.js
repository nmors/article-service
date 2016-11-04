'use strict' 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const P = require('bluebird')
const R = require('ramda')

// Requirement: for data store (I chose in-memory)
const { Articles } = require('./models') 

const NOT_FOUND_MSG = {err: {message: 'NOT_FOUND', code: 404}} // NOTE: this can be done better

/**
 *  Requirement 1. creates an article
 */
const createArticle = P.coroutine(function*(req, res) {
  const {err, resp} = yield Articles.create(req.body)
  if (err) return appErrorHandler(err, req, res);
  return res.json(resp)
})

/**
 *  Requirement 2. Gets a single article by ID
 */
const getArticle = P.coroutine(function*(req, res) {
  const {err, resp} = yield Articles.get(req.params.id)
  if (err) return appErrorHandler(err, req, res);
  return res.json(resp)
})

/**
 *  Requirement 3. Gets list of all articles with filter on tag and date
 */
const getAllArticlesByTagAndDate = P.coroutine(function*(req, res) {
  const {err, resp} = yield Articles.getAll(req.params) // tags and date paramer gets passed to the db query
  if (err) return appErrorHandler(err, req, res);
  // Requirement: Own tag
  const tag = req.params.tags
  // Requirement # 3A: get related_tags
  const getMatchedTags = R.map(R.prop(['tags']))
  const matchedTags = R.flatten(getMatchedTags(resp))
  const related_tags = R.reject(R.equals(tag), R.uniq(matchedTags))
  // Requirement #3B: number of tags for the day (requirement may need clarification)
  // const count = Articles.length <--this may have been the requirement instead, not sure??
  const count = matchedTags.length
  // Requirement #3C: Take the last 10 articles for that day, and return a list of their IDs
  const getIDsOfArticles = R.map(R.prop(['id']))
  const articles = getIDsOfArticles(R.takeLast(10, resp))
  return res.json({ count, articles, related_tags, tag })
})

/**
 *  Not a Requirement. Gets list of all articles
 */
const getAllArticles = P.coroutine(function*(req, res) {
  const {err, resp} = yield Articles.getAll(req.params.id)
  if (err) return appErrorHandler(err, req, res);
  return res.json(resp)
})

/**
 *  Middleware to Handles any uncaught errors with the express server
 */
const appErrorHandler = (error, req, res, next) => {
  //if (!error) return next();
  res.status(error.code || 500);
  return res.json(R.pick(['message', 'code'], error))
}

// Middlewares:
app.use(appErrorHandler);

// Routes:
app.post('/articles', bodyParser.json(), createArticle)
app.get('/articles', getAllArticles)
app.get('/articles/:id', getArticle)
app.get('/tags/:tags/:date', getAllArticlesByTagAndDate)

// Start the server:
app.listen(3000, v => console.log('articles tech-test app started on port 3000'))

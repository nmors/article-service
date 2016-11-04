'use strict' 
const P = require('bluebird')
const R = require('ramda')
const loki = require('lokijs') // => (I chose an In Memory Database for simplicity)
const db = new loki(require('./package.json').name)

// You could make this actual error object from an error factory or something, NOTE: this can be improved upon
const BAD_REQUEST_MSG = {err: {message: 'BAD_REQUEST', code: 400}}
const NOT_FOUND_MSG = {err: {message: 'NOT_FOUND', code: 404}}

// Builds a database query for lokijs using request parameters.
const lokiQueryFromParams = params => { 
  const myQuery = []
  R.mapObjIndexed((val, key, obj) => {
    const thisParam = {};
    thisParam[key] = {'$eq' : val} // for tags, use $contains (because it's an array), everything else use $eq
    if (key === 'tags') thisParam[key] = {'$contains' : val} 
    myQuery.push(thisParam)
  })(params)
  return { '$and': myQuery } 
}

const createLokiModel = (name, spec) => {
  const collection = db.addCollection(name);
  //const createRandomId = () => {return Math.random().toString(36).substring(7) + (Math.pow(10,13) / Date.now()).toString(36)}
  const autoCreateMyId = () => {
    const getNextId = d => ( R.propOr(0, '$loki', d) ) + 1
    // NOTE: strange behaviour with lokiJS sometimes returning a list from .findOne(), fixed below
    const latestDoc = R.takeLast(1, R.flatten([collection.findOne({})]))[0]
    return getNextId(latestDoc)
  }
  return {
    get(idString) {
      return new Promise(resolve => {
        const id = parseInt(idString) // this can be parsed by the api instead
        const dbResponse = collection.findOne({id})  
        if (R.isNil(dbResponse) || R.isEmpty(dbResponse)) return resolve(NOT_FOUND_MSG);
        const resp = spec(dbResponse)
        return resolve({resp})
      });
    },
    getAll(params) {
      return new Promise(resolve => {
        const dbQuery = params ? lokiQueryFromParams(params) : {}
        const dbResponse = collection.find(dbQuery)
        if (R.isNil(dbResponse) || R.isEmpty(dbResponse)) return resolve(NOT_FOUND_MSG);
        const resp = R.map(spec, dbResponse)
        return resolve({resp})
      });
    },
    create(payload) {
      return new Promise(resolve => {
        if (R.isNil(payload)) return resolve(BAD_REQUEST_MSG)
        if (!payload.id) payload.id = autoCreateMyId();
        const dbResponse = collection.insert(payload)
        const resp = spec(dbResponse)
        return resolve({resp})
      });
    }
  }
}

// Formats the articles objects as requirements
const articleSpec = R.applySpec({
  //id: R.prop('$loki'),
  id: R.prop('id'),
  title: R.propOr('Untitled', 'title'),
  date: R.prop('date'),
  body: R.prop('body'),
  tags: R.propOr([], 'tags'),
  //meta: R.prop('meta'),
})

module.exports = {
  Articles: createLokiModel('articles', articleSpec)
}

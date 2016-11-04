# article-service   

Author: Nathan Mors

This is the application created using Node.js as a response to the `tech-test` outlined at:
 - [Web Version](https://ffxblue.github.io/tech-test/)
 - [local copy](test/README.md)


This simple service handles articles in-memory. You can create or get articles. Updating and deleting articles is not yet implemented.



## Setup / Installation

```
$ npm install
$ npm start

```


### API Usage:

The API for the artcle service will run by default at 
`http://localhost:3000`




#### POST /articles
 - Creates a new article

 - When you create a new article, the same article is returned back to you, with the exception of the extra `id` field which is auto-generated

Example Request:
**application/json**
```js
{
  "title": "latest science shows that potato chips are better for you than sugar",
  "date" : "2016-09-22",
  "body" : "some text, potentially containing simple markup about how potato chips are great",
  "tags" : ["health", "fitness", "science"]
}
```

Example Response (200):
**application/json**
```js
{
  "id": 1
  "title": "latest science shows that potato chips are better for you than sugar",
  "date" : "2016-09-22",
  "body" : "some text, potentially containing simple markup about how potato chips are great",
  "tags" : ["health", "fitness", "science"]
}
```

Example Response (400):
 - You may get an error response if you do not supply an article
**application/json**
```js
{
  "message" : "BAD_REQUEST"
}
```


#### GET /articles
	Returns a list of all the articles


Example Response (200):
**application/json**
```js
[
 {
  "id": 1
  "title": "latest science shows that potato chips are better for you than sugar",
  "date" : "2016-09-22",
  "body" : "some text, potentially containing simple markup about how potato chips are great",
  "tags" : ["health", "fitness", "science"]
 },
 {
  "id": 2
  "title": "foo",
  "date" : "2016-09-22",
  "body" : "some text, potentially containing simple markup about how foo are great",
  "tags" : ["health"]
 }
]
```


#### GET /articles/{id}
	Returns a specific article, identified by `{id}`

	Parameters: 
	 - `{id}` Integer - the ID of the article that you want to retrieve


Example Response (200):
**application/json**
```js
{
  "id": 1
  "title": "latest science shows that potato chips are better for you than sugar",
  "date" : "2016-09-22",
  "body" : "some text, potentially containing simple markup about how potato chips are great",
  "tags" : ["health", "fitness", "science"]
}
```

#### GET /tags/{tagName}/{date}
	Returns details of specific articles, identified by `{date}` and `{tagName}`

  The details about the articles in the response are as described below (as per requirements and quoted from the [tech-test](https://ffxblue.github.io/tech-test/)
   - The related_tags field contains a list of tags that are on the articles that the current tag is on for the same day. It should not contain duplicates.
   - The count field shows the number of tags for the tag for that day.  `(Nathan: requirement may need clarification )`
   - The articles field contains a list of ids for the last 10 articles entered for that day.

	Parameters: 
	 - `{date}` the date of the article that you want to retrieve
	 - `{tagName}` the tagName of the article that you want to retrieve


Example Response (200):
```js
{
  "tag" : "health",
  "count" : 17,
    "articles" :[
      "1",
      "7"
    ],
    "related_tags":[
      "science",
      "fitness"
    ]
}
```




#### Note: Example Response (500):
 - You may get an error response if the server encounters an unexpected error
**application/json**
```js
{
  "message" : "SERVER_ERROR"
}
```



## Libraries / Dependencies Chosen:

There are 5 libraies used in this application. I will describe why I chose them:

    `"bluebird": "^3.4.6"` - Promises and utilities library. Provides more than the native Promise and some handy tools

    `"express": "^4.14.0"` - API library, router, middleware, caching and more - Chosen because it provides most of what you need to build an API, and it's very good support and popularity

    `"body-parser": "^1.15.2"` - To parse JSON in the request body, Used for parsing body of  POST /articles 
    
    `"lokijs": "^1.4.1"` - Used as an in-memory data store. Chosen for this test because it is a very simple DB
    
    `"ramda": "^0.22.1"` - Utility / Functional programming library. Very useful for getting stuff done elegantly. (Great alternative to lodash)



## Assumptions

 - There is no persistence of the database. If you restart the app, the data will be gone. This can quite easily be fixed.
 - DELETE and PUT is not implemented for purpose of the test
 - You could split the files into smaller files, or even directories, (for example, articles, errors, server, models, router(s), config, etc.. ) But, for simplicity sake and for the test sake, i have only used 2 files (index.js & models.js )
 - There is minimal request validation
 - For `GET /tags/{tagName}/{date}`, the `{tagName}` and `{date}` are filtered by the database by passing in req.params directly into the query (This could use some improvement, but again, it is done for the sake of simplicity)


## Thoughts

The thing that interested me about this test the most was the use and simplicity of lokijs, it was the first time I have ever used the library and it turned out to be pretty cool. Having adapters (localStorage, fs), or custom adapters for persistence, views, transactions is also interesting. It solved the requirements of the application nicely using pure JS.

It was also fun to realise that everything in the entire app turned out to be a `const`

I tried my best to make the end result code to be small, functional, elegant and easy to understand. I hope you like it.


The test took me about 2 hours in total, made up from: 
- initial coding approx 40 mins. 
- testing and fixing a few things, mainly with how lokijs works: about 30mins 
- I wrote the document and comments in about 45 minutes. 



## Contact

email: nathan at mors.me
phone: 0433660471




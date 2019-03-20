/*
(c) 2019 Louis. D. Nel

WARNING:
NOTE: THIS CODE WILL NOT RUN UNTIL YOU ENTER YOUR OWN openweathermap.org APP ID KEY

NOTE: You need to intall the npm modules by executing >npm install
before running this server

Simple express server re-serving data from openweathermap.org
To test:
http://localhost:3000
or
http://localhost:3000/weather?city=Ottawa
to just set JSON response. (Note it is helpful to add a JSON formatter extension, like JSON Formatter, to your Chrome browser for viewing just JSON data.)
*/
const express = require('express') //express framework
const http_request = require('request') //helpful npm module for easy http requests
const PORT = process.env.PORT || 3000 //allow environment variable to possible set PORT

const http = require('http')
const https = require('https')
const url = require('url')
const qstring = require('querystring')

/*YOU NEED AN APP ID KEY TO RUN THIS CODE
  GET ONE BY SIGNING UP AT openweathermap.org
*/
let API_KEY = '46be365e461116419f48a2b1855b4db2' //<== YOUR API KEY HERE

const app = express()

function sendResponse(recipeData, res) {
  var htmlView =
    '<html><head><title></title>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<link rel="stylesheet" href="styles/styles.css">' +
    '<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">' +
    '</head>' +

    '<body>' +
    '<form method="post">' +
    'Enter an ingredient: <input name="ingredient"><br>' +
    '<input class="center-block" type="submit" value="Submit" style="margin-bottom: 50px;">' +
    '</form>'

  if (recipeData) {
    htmlView += '<h1>food2fork Recipes '+'</h1>'

    //parse data into an array
    let recobj = JSON.parse(recipeData)


    for (let i=0; i < recobj.count; i++){
      let currRec = recobj.recipes[i]

      //display div container that acts as a link
       htmlView += '<div style = "display:inline-block; border:3px solid black;'
       + 'margin:30px;word-wrap: normal;" onclick = "location.href = \'' + currRec.f2f_url +'\'">'
       +'<img src = "' + currRec.image_url + '" height = "400" width = "400">'
       + '<h2 style = "text-align:center; word-wrap: normal; width : 400 ">' + currRec.title + '</h2></div>'
    }
  }
  htmlView += '</body></html>'
  res.end(htmlView);
}


function parseData(apiResponse, res) {
  let recipeData   = ""

  apiResponse.on('data', function(chunk) {
     recipeData += chunk
  })
  apiResponse.on('end', function() {
    sendResponse(recipeData, res)
  })
}

//helper function for app.get
function getRecipes(ingredient, res){

    const options = {
       host: 'www.food2fork.com',
       path: `/api/search?key=${API_KEY}`
    }

    if (ingredient != null){
      options.path = `/api/search?q=${ingredient}&key=${API_KEY}`
    }
    //retrieves data from food2fork
    https.request(options, function(apiResponse){
      //prob send to client here`````
      parseData(apiResponse, res)
    }).end()
}

//Middleware
app.use(express.static(__dirname + '/public')) //static server



//Routes
app.get('/', (request, response) => {
  let requestURL = request.url
  let query = url.parse(requestURL).query //GET method query parameters if any
  parsedIng = qstring.parse(query)

  //response.sendFile(__dirname + '/views/index.html') //Iqra
  getRecipes(parsedIng.ingredient, response)
})

//handle POST route
app.post('/', function (req, res) {
  let reqData = ''
  req.on('data', function(chunk) {
    reqData += chunk
  })
  req.on('end', function() {
    console.log(reqData);
    var queryParams = qstring.parse(reqData)
    console.log(queryParams)
    getRecipes(queryParams.ingredient, res)
  })
})
//if the url is not known, client is redirected to localhost:3000
app.use(redirectUnmatched)
function redirectUnmatched(req, res) {
  res.redirect("http://localhost:3000/");
}

/*
app.get('/recipes', (request, response) => {
  let ingredient = request.query.ingredient
  let url = ''
  if(!ingredient) {
    return response.json({message: 'Please enter an ingredient name'})
    url = `https://food2fork.com/api/search?key=${API_KEY}`
  }
  else {
    url = `https://food2fork.com/api/search?key=${API_KEY}&q=${ingredient}`
  }
    http_request.get(url, (err, res, data) => {
    return response.contentType('application/json').json(JSON.parse(data))
  })
})
*/

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
    console.log(`Server listening on port: ${PORT}`)
    console.log(`To Test:`)
    console.log(`http://localhost:3000/?ingredient=basil`)
    console.log(`http://localhost:3000`)
    console.log(`http://localhost:3000/`)
    console.log('http://localhost:3000/recipes')
    console.log(`http://localhost:3000/recipes.html`)
  }
})

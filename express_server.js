const { request } = require('express');
const express = require('express');
const morgan = require('morgan'); //if you want morgan,also need to 'npm i morgan in root folder
const app = express();
app.use(morgan('dev')); //if you want morgan dev
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com'
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8)
}

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});
//route to show the forum
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
//add new URL
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  //console.log(shortURL);
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase);
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  //console.log(req.params);
  //route shortURL to longURL page, found shortURL in param object
});
// redirect to the long URL
app.get('/u/:shortURL', (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  console.log(longURL,'..........................................');
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
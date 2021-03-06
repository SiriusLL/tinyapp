const { request } = require('express');
const express = require('express');
const morgan = require('morgan'); //if you want morgan,also
const cookieParser = require('cookie-parser');
// need to 'npm i morgan in root folder
const app = express();
app.use(morgan('dev')); //if you want morgan dev
const bodyParser = require('body-parser');
const { restart } = require('nodemon');
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 8080; // default port 8080
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.com',
};

//database object for users
const users = {
  userRandomID: {
    id: 'userRandomeID',
    email: 'user@examle.com',
    password: 'purple-monkey-dinosaur',
  },
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});
//main urls page
//passes urls and username to ejs
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render('urls_index', templateVars);
});
//route to show the forum
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render('urls_new', templateVars);
});
//add new URL
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  //console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req,
  };
  console.log(templateVars);
  res.render('urls_show', templateVars);
  //console.log(req.params);
  //route shortURL to longURL page, found shortURL in param object
});
// redirect to the long URL
app.get('/u/:shortURL', (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  console.log(longURL, '..........................................');
  res.redirect(longURL);
});
//post to delet short url, req.params.shortURL is the key for the short url
app.post('/urls/:shortURL/delete', (req, res) => {
  console.log('key', req.params);
  //req.params.shortURL
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
// edit the long url
app.post('/urls/:shortURL', (req, res) => {
  console.log('req', req.body);
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// app.get("/login", (req, res) => {
//   const templateVars = {
//     username: req.cookies["username"]
//   };
//   res.render('urls_index', templateVars);

// })

//added login request checks if user exists, redirects to urls

//renders register page
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/login', (req, res) => {
  const username = req.body && req.body.username ? req.body.username : '';
  res.cookie('username', username);
  res.redirect('/urls');

  //if (username.length) {
  //res.redirect(`/urls/${username}`)
  // } else {
  //   res.redirect('/urls')
  // };
  //console.log(req.body.username);
});

//takes input of user registration, generage new user id and add it and email pass to user object, set cookie and redirect to /urls
app.post('/register', (req, res) => {
  //
  //console.log("register req.body", req.body);
  //console.log("cookie", req);
  const newId = generateRandomString();
  const { email, password } = req.body;

  users[newId] = { id: newId, email: email, password: password };
  res.cookie('user_id', newId);
  console.log(users);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//req.cookies[userName]

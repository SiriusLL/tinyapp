const { request } = require('express');
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const { restart } = require('nodemon');
const { findUserByEmail, findUserById, urlsForUser, generateRandomString } = require('./helpers');
const app = express();
const PORT = 8080;


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['theDark', 'theLight']
}));


app.set('view engine', 'ejs');

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomeID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};
console.log('---------->',findUserByEmail('user@example.com', users));
app.get('/', (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.statusCode = 403;
    res.redirect('/login');
    return;
  }

  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//main urls page
//passes urls and username to ejs
app.get('/urls', (req, res) => {
  const cookie = req.session.user_id;
  const userUrls = urlsForUser(cookie, urlDatabase);
  const user = findUserById(users, cookie);
  const templateVars = { urls: userUrls, username: users[req.session.user_id], loginCheck: user };
  
  // if (!user) {
  //   res.statusCode = 400;
  //   res.send('please sign in to access');
  //   return;
  // };

  res.render('urls_index', templateVars);
});

//route to show the new url create form
//modified to only let login users access creat new url
app.get('/urls/new', (req, res) => {
  const templateVars = { username: users[req.session.user_id] };
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.redirect('/login');
    return;
  }
  
  res.render('urls_new', templateVars);
});

//add new URL
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const id = req.session.user_id;
  const user = findUserById(users, id);
  
  if (!user) {
    res.statusCode = 400;
    res.send('please sign in to access');
    return;
  }

  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  res.redirect(`/urls/${shortURL}`);
});

//added username to templateVars in all res.render
app.get("/urls/:shortURL", (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.statusCode = 403;
    res.send('please sign in to access');
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, username: users[req.session.user_id] };
  
  if (cookie !== urlDatabase[req.params.shortURL].userID) {
    res.statusCode = 404;
    res.send('requested resource was not found');
    return;
  }
 
  res.render("urls_show", templateVars);
});
// redirect to the long URL
app.get('/u/:shortURL', (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.statusCode = 403;
    res.send('please sign in to access');
    return;
  }

  if (cookie !== urlDatabase[req.params.shortURL].userID) {
    res.statusCode = 404;
    res.send('requested resource was not found');
    return;
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//post to delet short url, req.params.shortURL is the key for the short url
app.post("/urls/:shortURL/delete", (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.statusCode = 403;
    res.send('please sign in to access');
    return;
  }

  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// edit the long url
app.post("/urls/:shortURL", (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.statusCode = 403;
    res.send('please sign in to access');
    return;
  }

  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);

  if (!user) {
    res.render('login');
    return;
  }
  res.redirect('/urls');
});

//added login request checks if user exists, redirects to urls or register if not exist
app.get("/register", (req, res) => {
  const cookie = req.session.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.render('register');
    return;
  }
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(users, email);
  console.log(user,'<<<<');
  if (!user) {
    res.statusCode = 403;
    res.send('Incorrect login info, please try again');
    return;
  }

  bcrypt.compare(password, users[user].password)
    .then((result) => {
      
      if (result) {
        req.session.user_id = user;
        res.redirect('/urls');
      } else {
        res.statusCode = 403;
        res.send('Incorrect login info, please try again');
        return;
      }
    });
});

//takes input of user registration, generage new user id and add it and email pass to user object, set cookie and redirect to /urls
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const { email, password } = req.body;
  
  if (!req.body.email.length) {
    res.statusCode = 400;
    res.send('Email field can not be blank');
    return;
  }
  if (!req.body.password.length) {
    res.statusCode = 400;
    res.send('Password field can not be blank');
    return;
  }
  if (findUserByEmail(users, email)) {
    res.statusCode = 400;
    res.send('This email has already been used');
    return;
  }
    
  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      users[newId] = { id: newId,
        email: email,
        password: hash
      };
      
      req.session.user_id = users[newId].id;
      res.redirect('/urls');
    });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


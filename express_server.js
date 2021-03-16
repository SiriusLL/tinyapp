const { request } = require('express');
const express = require('express');
const morgan = require('morgan'); //if you want morgan,also 
const cookieParser = require("cookie-parser");
// need to 'npm i morgan in root folder
const app = express();
app.use(morgan('dev')); //if you want morgan dev
const bodyParser = require("body-parser");
const { restart } = require('nodemon');
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080
app.use(cookieParser())

app.set('view engine', 'ejs');

// const urlDatabase = {
//   'b2xVn2': 'http://www.lighthouselabs.ca',
//   '9sm5xk': 'http://www.google.com'
// };

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
// database object for users
// const userLookup = (email) => {
//   //console.log(email in users);
//   return (email in users);
// };

const findUserByEmail = (users, email) => {
  for(let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    } 
  }
  return false;
}
// finds user id and returns user id or false;
const findUserById = (users, id) => {
  for (let userId in users) {
    if (users[userId].id === id) {
      
      return users[userId].id;
    }
  }
  return false;
}
// const authenticateUser = (users, email, password) => {
//  //this function is finding users email;
//   const userFound = findUserByEmail(users, email);
  
//   if(userFound && userFound.password === password) {
//     return userFound
//   }
  
//   return false;
// }

const generateRandomString = () => {
return Math.random().toString(36).substring(2, 8)
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
  const templateVars = { urls: urlDatabase, username: users[req.cookies.user_id] };
  // console.log('users',users);
  // console.log('cookies',req.cookies.user_id);
  // console.log('all of the things', users[req.cookies.user_id])
  // console.log('templateVars', templateVars)
  // console.log('username', templateVars.username.email);
  res.render('urls_index', templateVars);
  
});
//route to show the forum
//modified to only let login users access creat new url
app.get('/urls/new', (req, res) => {
  const templateVars = { username: users[req.cookies.user_id] };
  const cookie = req.cookies.user_id;
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
  const id = req.cookies.user_id;
  const user = findUserById(users, id)
  if (!user) {
    res.statusCode = 400;
    res.send('please sign in to access');
    return;
  }
  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  
  res.redirect(`/urls/${shortURL}`);
  //console.log(urlDatabase);
})
//added username to templateVars in all res.render requests------finished to here>>---------------------------------
app.get("/urls/:shortURL", (req, res) => {
  const cookie = req.cookies.user_id;
  const user = findUserById(users, cookie);
  
  if (!user) {
    res.statusCode = 403;
    res.send('please sign in to access');
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, username: users[req.cookies.user_id] };
  console.log(templateVars);
  //console.log(req.cookies);
  res.render("urls_show", templateVars);
  //console.log(req.params);
  //route shortURL to longURL page, found shortURL in param object
});
// redirect to the long URL
app.get('/u/:shortURL', (req, res) => {
  longURL = urlDatabase[req.params.shortURL].longURL;
   console.log(req.params,'..........................................');
  res.redirect(longURL);
});
//post to delet short url, req.params.shortURL is the key for the short url
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log('key', req.params)
  //req.params.shortURL
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
// edit the long url
app.post("/urls/:shortURL", (req, res) => {
  // console.log('req',req.body);
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  
  res.render('login');
})

//added login request checks if user exists, redirects to urls

//renders register page
app.get("/register", (req, res) => {

  res.render('register');
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //const username = req.body && req.body.username ? req.body.username : "";
  const user = findUserByEmail(users, email);
  if (!user) {
    res.statusCode = 403;
    res.send('Incorrect login info, please try again');
    return;
  }
  if (user.password !== password) {
    res.statusCode = 403;
    res.send('Incorrect login info, please try again')
    return;
  }
  
  res.cookie('user_id', user.id);
  res.redirect('/urls');
  
  //if (username.length) {
    //res.redirect(`/urls/${username}`)
  // } else {
  //   res.redirect('/urls')
  // };
  //console.log(req.body.username);
});

//takes input of user registration, generage new user id and add it and email pass to user object, set cookie and redirect to /urls
app.post("/register", (req, res) => {
  const newId = generateRandomString();
  const { email, password } = req.body;
  
  //error status code 400
  console.log('wht is this-->', findUserByEmail(users,email));
  if(!req.body.email.length || !req.body.password.length) {
    res.statusCode = 400;
    res.send('Please pick a username');
  } else if (findUserByEmail(users, email)) {
    res.statusCode = 400
    res.send('This email has already been used')
  } else {
    users[newId] = { id: newId, email: email, password: password };
    res.cookie('user_id', newId);
    res.redirect('/urls');
  };
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


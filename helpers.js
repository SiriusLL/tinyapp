const findUserByEmail = (users, email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return false;
};

const findUserById = (users, id) => {
  for (let userId in users) {
    if (users[userId].id === id) {
      return users[userId].id;
    }
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = {
  findUserByEmail,
  findUserById,
  urlsForUser,
  generateRandomString,
};

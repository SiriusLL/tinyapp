const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');

const testUsers = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

describe('findUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = findUserByEmail(testUsers, 'user@example.com');
    const expectedOutput = 'userRandomID';
    assert.equal(expectedOutput, user);
  });
  it('should return false when given an invalid user', () => {
    const user = findUserByEmail(testUsers, 'user3@example.com');
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });
});

console.log(findUserByEmail(testUsers, 'user@example.com'));

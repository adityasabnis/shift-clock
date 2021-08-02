const bcrypt = require('bcrypt');

const saltRounds = 2;

exports.hashPassword = async (plainTextPassword) =>
  bcrypt.hash(plainTextPassword, saltRounds);

exports.verifyPassword = async (plainTextPassword, passwordHash) =>
  bcrypt.compare(plainTextPassword, passwordHash);

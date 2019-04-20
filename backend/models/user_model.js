const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cpf: { type: String, required: true },
  nome: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = {
  model: mongoose.model('User', userSchema),
  userSchema
};
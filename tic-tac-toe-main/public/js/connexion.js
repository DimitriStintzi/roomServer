const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Définition du schéma MongoDB
const userSchema = new mongoose.Schema({
  username: String
});
const User = mongoose.model('User', userSchema);

// Analyser les requêtes de type application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Gérer la requête POST pour enregistrer le nom d'utilisateur
app.post('/login', (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  newUser.save()
    .then(() => {
      res.send('User saved successfully!');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error saving user');
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

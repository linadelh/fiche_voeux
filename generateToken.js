
const jwt = require('jsonwebtoken');

// Clé secrète utilisée pour signer le token (assure-toi qu'elle correspond à ton fichier .env)
const secretKey = process.env.JWT_SECRET || 'secret_key'; 

// Payload du token
const payload = {
  id: 1,               // Remplace par l'ID de test
  role: 'admin',       // Remplace par le rôle requis ('admin', 'enseignant', etc.)
};

// Options du token
const options = {
  expiresIn: '1h',     // Le token sera valide pendant 1 heure
};

// Générer le token
const token = jwt.sign(payload, secretKey, options);

console.log("Votre token de test :", token);

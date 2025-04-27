// config/database.js
const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize('gestion_voeux', 'root', '0101', {
  host: 'localhost',
  dialect: 'mysql', 
});

module.exports = sequelize;


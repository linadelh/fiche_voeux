const { Sequelize } = require('sequelize');

// Configuration de la connexion DB (à adapter selon votre config)
const sequelize = new Sequelize('gestion_voeux', 'root', '', {
  host: 'localhost',
  dialect: 'mysql' // ou 'postgres', 'sqlite', etc.
});

// Importe les modèles
const Utilisateur = require('./Utilisateur');
const Enseignant = require('./Enseignant');
const Voeu = require('./Voeu');
const Module = require('./Module');
const ModuleVoeu = require('./ModuleVoeu'); 
const Message = require('./Message')(sequelize, Sequelize.DataTypes);
const Notification = require('./Notification'); 
// Définition de l'objet models
const models = {
  Utilisateur,
  Enseignant,
  Voeu,
  Module,
  ModuleVoeu,
  Message,
  Notification 
};

// Appelle les associations définies dans chaque modèle s'il y en a
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

function setupAssociations() {
  // Relation 1: Utilisateur → Enseignant (1-to-1)
  Utilisateur.hasOne(Enseignant, {
    foreignKey: 'utilisateur_id',
    onDelete: 'CASCADE'
  });
  Enseignant.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id' });

  // Relation 2: Enseignant → Voeux (1-to-Many)
  Enseignant.hasMany(Voeu, {
    foreignKey: 'utilisateur_id',
    as: 'voeux' 
  });
  Voeu.belongsTo(Enseignant, { foreignKey: 'utilisateur_id' });

  // Relation 3: Voeu ↔ Module (Many-to-Many via ModuleVoeu)
  Voeu.belongsToMany(Module, {
    through: ModuleVoeu,
    foreignKey: 'voeu_id',
    otherKey: 'module_id',
    as: 'modules'
  });

  Module.belongsToMany(Voeu, {
    through: ModuleVoeu,
    foreignKey: 'module_id',
    otherKey: 'voeu_id'
  });
}

setupAssociations();



// Exporte les modèles + associations
module.exports = {
  sequelize,
  ...models,
  setupAssociations,
};


const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Enseignant = require('./Enseignant');

const Voeu = sequelize.define('Voeu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Enseignant,
      key: 'utilisateur_id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  annee: {  
    type: DataTypes.INTEGER, // Utiliser un champ INT pour l'année
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('en attente', 'accepté', 'en négociation', 'refusé'),
    defaultValue: 'en attente'
  },
  nb_pfe_licence: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  nb_pfe_master: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  heures_sup: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_soumission: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'voeux'
});
Voeu.associate = (models) => {
  Voeu.hasMany(models.ModuleVoeu, {
    foreignKey: 'voeu_id',
    as: 'modules_voeux'
  });
};
module.exports = Voeu;

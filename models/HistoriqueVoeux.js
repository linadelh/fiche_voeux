
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoriqueVoeux = sequelize.define('HistoriqueVoeux', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  voeu_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Voeux',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: { //ne fonctionne pas il faut la partie des autres filles
    type: DataTypes.ENUM('en attente', 'accepté', 'en négociation', 'refusé'),
    allowNull: false,
  },
  semestre: {
    type: DataTypes.ENUM('S1', 'S2'),
    allowNull: false,
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: 'historique_voeux',
});

module.exports = HistoriqueVoeux;

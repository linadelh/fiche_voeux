const express = require('express');
const router = express.Router();
const { Voeu, ModuleVoeu, Module } = require('../models');
const sequelize = require('../config/database');


router.get('/satisfaction', async (req, res) => {
    try {
      const voeuxAcceptes = await Voeu.count({ where: { status: 'accepté' } });
      const totalVoeux = await Voeu.count();
      
      if (totalVoeux === 0) {
        return res.status(200).json({ pourcentage: 0 });
      }
  
      const pourcentage = ((voeuxAcceptes / totalVoeux) * 100).toFixed(2);
      res.status(200).json({ pourcentage });
    } catch (err) {
      console.error('Erreur lors du calcul des statistiques :', err);
      res.status(500).json({ error: 'Erreur lors du calcul des statistiques.' });
    }
  });
  


router.get('/modules-demandes', async (req, res) => {      // il manque les parties des autres filles
  try {
    const modulesDemandes = await ModuleVoeu.findAll({
      attributes: ['module_id', [sequelize.fn('COUNT', 'module_id'), 'nombreDemandes']],
      group: ['module_id'],
      order: [[sequelize.literal('nombreDemandes'), 'DESC']],
      include: [{ model: Module, attributes: ['nom_module'] }],
      limit: 5
    });

    res.status(200).json(modulesDemandes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des modules les plus demandés.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Voeu, ModuleVoeu, Module, Enseignant } = require('../models');

router.get('/', async (req, res) => {
  try {
    const recapitulatif = await Voeu.findAll({
      attributes: ['semestre', 'status'],
      include: [
        {
          model: ModuleVoeu,
          attributes: ['type_enseignement'],
          include: [
            {
              model: Module,
              attributes: ['nom_module', 'heures_cours', 'heures_td', 'heures_tp']
            }
          ]
        },
        {
          model: Enseignant,
          attributes: ['nom', 'prenom', 'grade', 'departement']
        }
      ]
    });

    res.status(200).json(recapitulatif);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du tableau récapitulatif.' });
  }
});

module.exports = router;

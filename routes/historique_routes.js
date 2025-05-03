
const express = require('express');
const router = express.Router();
const { HistoriqueVoeux, Voeu /* la partie des autres filles*/} = require('../models');

router.get('/', async (req, res) => {
  try {
    const historique = await HistoriqueVoeux.findAll({
      include: [
        {
          model: Voeu,
          attributes: ['id', 'status', 'semestre']
        }
      ]
    });

    res.status(200).json(historique);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l’historique.' });
  }
});

module.exports = router;

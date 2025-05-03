const express = require('express');
const router = express.Router();
const { HistoriqueVoeux, Voeu } = require('../models');

// Récupérer l'historique des vœux
router.get('/historique', async (req, res) => {
  try {
    const historique = await HistoriqueVoeux.findAll({
      include: [{ model: Voeu }],
    });
    res.status(200).json(historique);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l’historique.' });
  }
});

module.exports = router;

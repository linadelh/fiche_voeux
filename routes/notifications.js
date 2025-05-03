const express = require('express');
const router = express.Router();
const { 
  createNotification, 
  markAsRead,
  getNotificationsByUser
} = require('../controllers/notificationController.js');

router.post('/creer', async (req, res) => {
  const { utilisateurId, message } = req.body;
  try {
    await createNotification(utilisateurId, message);
    res.status(201).send('Notification créée avec succès.');
  } catch (error) {
    res.status(500).send('Erreur lors de la création de la notification.');
  }
});

router.patch('/marquer-lue/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await markAsRead(id);
    res.status(200).send('Notification marquée comme lue.');
  } catch (error) {
    res.status(500).send('Erreur lors de la mise à jour de la notification.');
  }
});

router.get('/utilisateur/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const notifications = await getNotificationsByUser(id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des notifications.');
  }
});

module.exports = router;
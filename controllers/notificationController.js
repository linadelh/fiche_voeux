const Notification = require('../models/Notification');

const createNotification = async (utilisateurId, message) => {
  try {
    const notification = await Notification.create({
      utilisateur_id: utilisateurId,
      message: message
    });
    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification :', error);
    throw error;
  }
};

const markAsRead = async (notificationId) => {
  try {
    const [updated] = await Notification.update(
      { statut: 'lue' },
      { where: { id: notificationId } }
    );
    return updated;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification :', error);
    throw error;
  }
};

const getNotificationsByUser = async (utilisateurId) => {
  try {
    const notifications = await Notification.findAll({
      where: { utilisateur_id: utilisateurId },
      order: [['date_creation', 'DESC']]
    });
    return notifications;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications :', error);
    throw error;
  }
};

module.exports = { 
  createNotification, 
  markAsRead,
  getNotificationsByUser
};

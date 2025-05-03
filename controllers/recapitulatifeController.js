const Voeu = require('../models/Voeu');
const ModuleVoeu = require('../models/ModuleVoeu');
const Module = require('../models/Module');
const Enseignant = require('../models/Enseignant');
// partie des autres filles

const getRecapitulatif = async (req, res) => {
  try {
    const recapitulatif = await Voeu.findAll({
      where: { status: 'accepté' },
      include: [
        {
          model: ModuleVoeu,
          include: [
            {
              model: Module,
              attributes: ['nom_module', 'type_enseignement']
            }
          ]
        },
        {
          model: Enseignant,
          attributes: ['utilisateur_id', 'departement', 'faculte']
        }
      ]
    });

    res.json(recapitulatif);
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau récapitulatif :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = { getRecapitulatif };

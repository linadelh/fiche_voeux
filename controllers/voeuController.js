
// controllers/voeuController.js
const { Voeu, ModuleVoeu, Module } = require('../models');
const { Op } = require('sequelize');

/**
 * Vérifie qu’on a bien 3 modules par semestre,
 * qu’ils existent et appartiennent au bon semestre.
 */
async function validerChoixParSemestre(choixS1, choixS2) {
  if (!Array.isArray(choixS1) || !Array.isArray(choixS2)) {
    return { valide: false, message: "Les choix doivent être des tableaux." };
  }

  // minimum 3
  if (choixS1.length < 3 || choixS2.length < 3) {
    return {
      valide: false,
      message: "Vous devez sélectionner **au moins** 3 modules pour chaque semestre.",
    };
  }

  const tousOK = [...choixS1, ...choixS2].every(
    c => c && c.moduleId && Array.isArray(c.type_enseignement)
  );
  if (!tousOK) {
    return {
      valide: false,
      message: "Chaque choix doit avoir `moduleId` et un tableau `type_enseignement`.",
    };
  }

  const moduleIds = [...choixS1, ...choixS2].map(c => c.moduleId);
  const modules = await Module.findAll({
    where: { id: { [Op.in]: moduleIds } },
    attributes: ['id', 'semestre'],
  });

  if (modules.length !== moduleIds.length) {
    return { valide: false, message: "Certains modules n’existent pas." };
  }

  const mapSem = Object.fromEntries(modules.map(m => [m.id, m.semestre]));
  const badS1 = choixS1.filter(c => mapSem[c.moduleId] !== 'S1');
  if (badS1.length) {
    return {
      valide: false,
      message: `Modules invalides en S1 : ${badS1.map(c => c.moduleId).join(', ')}`,
    };
  }
  const badS2 = choixS2.filter(c => mapSem[c.moduleId] !== 'S2');
  if (badS2.length) {
    return {
      valide: false,
      message: `Modules invalides en S2 : ${badS2.map(c => c.moduleId).join(', ')}`,
    };
  }

  return { valide: true };
}


exports.soumettreFicheVoeux = async (req, res) => {
  try {
    const utilisateurId = req.user.enseignantId || req.user.id;
    const {
      choixS1,  // ne plus donner de valeur par défaut ici
      choixS2,
      nb_pfe_licence = 1,
      nb_pfe_master = 1,
      heures_sup = 0,
      commentaire = ''
    } = req.body;

    // Presence check
    if (choixS1 === undefined || choixS2 === undefined) {
      return res.status(400).json({
        message: "Les champs `choixS1` et `choixS2` sont obligatoires."
      });
    }

    
    const { valide, message } = await validerChoixParSemestre(choixS1, choixS2);
    if (!valide) {
      return res.status(400).json({ message });  // **NE PAS OUBLIER** le return !
    }

    //Vérifier PFE min
    if (nb_pfe_licence < 1 || nb_pfe_master < 1) {
      return res.status(400).json({
        message: "Le nombre de PFE Licence et Master doit être ≥ 1."
      });
    }

    
    const today = new Date();
    const annee = today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1;

    // une seule fiche pas de doublon 
    const exist = await Voeu.findOne({
      where: { utilisateur_id: utilisateurId, annee }
    });
    if (exist) {
      return res.status(400).json({
        message: ` Fiche de l’année ${annee} déjà soumise.`
      });
    }

    // creation de la fiche
    const voeu = await Voeu.create({
      utilisateur_id: utilisateurId,
      nb_pfe_licence,
      nb_pfe_master,
      heures_sup,
      commentaire,
      annee,
      date_soumission: today
    });

    // bulk insert
    const voeuxModules = [];
    for (const sem of [choixS1, choixS2]) {
      for (const { moduleId, type_enseignement } of sem) {
        for (let t of type_enseignement) {
          t = ['cours','td','tp'].includes(t.toLowerCase()) ? t.toUpperCase() : t;
          voeuxModules.push({
            voeu_id: voeu.id,
            module_id: moduleId,
            type_enseignement: t
          });
        }
      }
    }
    await ModuleVoeu.bulkCreate(voeuxModules);

    // Succès
    return res.status(201).json({
      message: `🎉 Fiche ${annee} créée (ID=${voeu.id}).`
    });

  } catch (err) {
    console.error("❌ Erreur soumission voeux:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la soumission."
    });
  }
};
/**
 * Récupère la dernière fiche de vœux de l'utilisateur
 */
exports.recupererDerniersVoeux = async (req, res) => {
  const utilisateurId = req.user.enseignantId || req.user.id;
  
  try {
    const dernierVoeu = await Voeu.findOne({
      where: { utilisateur_id: utilisateurId },
      order: [['date_soumission', 'DESC']],
      include: [{
        model: ModuleVoeu,
        include: [{
          model: Module,
          attributes: ['id', 'nom', 'niveau', 'filiere', 'semestre', 'nb_heures_cours', 'nb_heures_td', 'nb_heures_tp']
        }]
      }]
    });
    
    if (!dernierVoeu) {
      return res.status(404).json({ 
        message: "Vous n'avez pas encore soumis de fiche de vœux. Veuillez en créer une nouvelle."
      });
    }
    
    // Organiser les modules par semestre 
    const moduleS1 = [];
    const moduleS2 = [];
    
    dernierVoeu.ModuleVoeux.forEach(mv => {
      if (mv.Module.semestre === 'S1') {
        moduleS1.push({
          id: mv.Module.id,
          nom: mv.Module.nom,
          type_enseignement: mv.type_enseignement,
          niveau: mv.Module.niveau,
          filiere: mv.Module.filiere,
          nb_heures_cours: mv.Module.nb_heures_cours,
          nb_heures_td: mv.Module.nb_heures_td,
          nb_heures_tp: mv.Module.nb_heures_tp
        });
      } else if (mv.Module.semestre === 'S2') {
        moduleS2.push({
          id: mv.Module.id,
          nom: mv.Module.nom,
          type_enseignement: mv.type_enseignement,
          niveau: mv.Module.niveau,
          filiere: mv.Module.filiere,
          nb_heures_cours: mv.Module.nb_heures_cours,
          nb_heures_td: mv.Module.nb_heures_td,
          nb_heures_tp: mv.Module.nb_heures_tp
        });
      }
    });
    
    // Structurer la réponse
    const response = {
      id: dernierVoeu.id,
      annee: dernierVoeu.annee,
      date_soumission: dernierVoeu.date_soumission,
      nb_pfe_licence: dernierVoeu.nb_pfe_licence,
      nb_pfe_master: dernierVoeu.nb_pfe_master,
      heures_sup: dernierVoeu.heures_sup,
      commentaire: dernierVoeu.commentaire,
      choixS1: moduleS1,
      choixS2: moduleS2
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des données." });
  }
};

/**
 * Liste tous les modules disponibles pour les vœux
 */
exports.listerModules = async (req, res) => {
  try {
    const modules = await Module.findAll({
      attributes: ['id', 'nom', 'niveau', 'filiere', 'semestre', 'nb_heures_cours', 'nb_heures_td', 'nb_heures_tp'],
      order: [['semestre', 'ASC'], ['niveau', 'ASC'], ['filiere', 'ASC'], ['nom', 'ASC']]
    });
    
    // Organiser les modules par semestre
    const modulesS1 = modules.filter(m => m.semestre === 'S1');
    const modulesS2 = modules.filter(m => m.semestre === 'S2');
    
    res.status(200).json({
      modulesS1,
      modulesS2
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des modules." });
  }
};

/**
 * Modifie une fiche de vœux existante
 */
// Fichier controllers/voeuController.js
exports.modifierFicheVoeux = async (req, res) => {
  try {
    const voeuId = req.params.id;
    const { choixS1, choixS2, nb_pfe_licence, nb_pfe_master, heures_sup, commentaire } = req.body;

    // Validation de l'existence du vœu
    const voeuExist = await Voeu.findByPk(voeuId);
    if (!voeuExist) {
      return res.status(404).json({ message: 'Vœu non trouvé.' });
    }

    // Mise à jour de la fiche de vœux
    const updatedVoeu = await voeuExist.update({
      nb_pfe_licence,
      nb_pfe_master,
      heures_sup,
      commentaire,
      date_soumission: new Date()  // Mettre à jour la date de soumission si nécessaire
    });

    // Mise à jour des modules associés
    await ModuleVoeu.destroy({ where: { voeu_id: voeuId } }); // Supprimer les anciens modules
    const voeuxModules = [];

    const formaterModules = (choixSemestre) => {
      choixSemestre.forEach(choix => {
        choix.type_enseignement.forEach(type => {
          let typeFormatted;
          switch (type.toLowerCase()) {
            case 'cours': typeFormatted = 'Cours'; break;
            case 'td': typeFormatted = 'TD'; break;
            case 'tp': typeFormatted = 'TP'; break;
            default: typeFormatted = type;
          }

          voeuxModules.push({
            voeu_id: updatedVoeu.id,
            module_id: choix.moduleId,
            type_enseignement: typeFormatted
          });
        });
      });
    };

    formaterModules(choixS1);
    formaterModules(choixS2);

    // Enregistrer les nouveaux modules associés
    await ModuleVoeu.bulkCreate(voeuxModules);

    // Réponse finale
    res.status(200).json({
      message: 'Fiche de vœux mise à jour avec succès.',
      voeuId: updatedVoeu.id
    });
  } catch (error) {
    console.error(" Erreur lors de la mise à jour :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de la fiche de vœux."
    });
  }
};

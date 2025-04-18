const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Utilisateur = require("../models/Utilisateur");

// ✅ INSCRIPTION
const register = async (req, res) => {
  const {
    nom,
    prenom,
    email,
    password,
    grade,
    faculte,
    departement,
    role // envoyé en dur depuis le frontend (ex : "enseignant")
  } = req.body;

  // Validation des champs obligatoires
  if (!nom || !prenom || !email || !password || !role) {
    return res.status(400).json({ message: "Les champs obligatoires sont manquants." });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur
    const user = await Utilisateur.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
      grade,
      faculte,
      departement
    });

    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
};

// ✅ CONNEXION
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Utilisateur.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Connexion réussie.",
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        grade: user.grade,
        faculte: user.faculte,
        departement: user.departement
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

module.exports = { register, login };

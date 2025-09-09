cat > routes/auth.js << 'EOF'
const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Validations
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username doit contenir 3-30 caractères (lettres, chiffres, underscore uniquement)'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);

// OAuth Google
router.get('/oauth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/oauth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  authController.googleCallback
);

// Route d'erreur OAuth
router.get('/error', (req, res) => {
  res.status(400).json({
    success: false,
    message: 'Erreur lors de l\'authentification OAuth'
  });
});

module.exports = router;
EOF
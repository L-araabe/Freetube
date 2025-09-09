const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findByEmail(profile.emails[0].value);
    
    if (user) {
      return done(null, user);
    }

    // Créer un nouvel utilisateur
    const newUser = await User.createFromGoogle({
      email: profile.emails[0].value,
      username: profile.displayName.replace(/\s+/g, '').toLowerCase() + '_' + Date.now(),
      photo: profile.photos[0].value,
      googleId: profile.id
    });

    done(null, newUser);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
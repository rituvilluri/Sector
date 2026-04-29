const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return done(null, false, { message: 'No account found with that email.' });
      }
      if (!user.password) {
        return done(null, false, { message: 'This account uses Google sign-in.' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const email = profile.emails?.[0]?.value;
          if (email) user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;

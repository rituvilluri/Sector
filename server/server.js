require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const sessionRoutes = require('./routes/sessions');

const app = express();

// 1. Database
connectDB();

// 2. CORS — before session so preflight OPTIONS requests get the header
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Session — stored in MongoDB via connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongooseConnection: mongoose.connection,
      ttl: 7 * 24 * 60 * 60,
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// 5. Passport (must come after session)
app.use(passport.initialize());
app.use(passport.session());

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/sessions', sessionRoutes);

// 7. 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// 8. Global error handler (4 params — Express identifies error handlers by arity)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

// 9. Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sector API running on port ${PORT} [${process.env.NODE_ENV}]`);
});

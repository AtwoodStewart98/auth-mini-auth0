const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const config = require("./config");

const port = 3000;

const app = express();

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "my-random-string"
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new Auth0Strategy(
    {
      domain: config.domain,
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: "/auth/callback"
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get("/auth", passport.authenticate("auth0"));

app.get(
  "/auth/callback",
  passport.authenticate("auth0", { successRedirect: "/" }),
  (req, res, next) => {
    res.status(200).json(req.user);
  }
);

app.get("/auth/me", (req, res, next) => {
  if (!req.user) return res.status(401).json({ err: "No User on Req" });
  res.json(req.user);
});

app.listen(port, () => {
  console.log(`Listening on Port: ${port}`);
});

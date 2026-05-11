import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import Author from "../models/author.js";

export default function configurePassport() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID:    process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/oauth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error("No email from Google"), null);
            let user = await Author.findOne({ email });
            if (!user) {
              user = await Author.create({
                Fullname: profile.displayName || email.split("@")[0],
                email,
                password: Math.random().toString(36),
                role: "student",
                photo: profile.photos?.[0]?.value || "",
              });
            }
            return done(null, user);
          } catch (e) {
            return done(e, null);
          }
        }
      )
    );
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID:    process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/oauth/github/callback",
          scope: ["user:email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email =
              profile.emails?.find((e) => e.primary)?.value ||
              profile.emails?.[0]?.value ||
              `${profile.username}@github.local`;
            let user = await Author.findOne({ email });
            if (!user) {
              user = await Author.create({
                Fullname: profile.displayName || profile.username || email.split("@")[0],
                email,
                password: Math.random().toString(36),
                role: "student",
                photo: profile.photos?.[0]?.value || "",
              });
            }
            return done(null, user);
          } catch (e) {
            return done(e, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Author.findById(id).select("-password");
      done(null, user);
    } catch (e) {
      done(e, null);
    }
  });
}

// This middleware assumes cookieParser has been "used" before this
import {sendError} from "./responseHelper";
import * as crypto from "crypto";

const twoHours = 7200000;
const tokenLength = 16;
const duration = twoHours;
export const cookieName = 'SeaQLAuth'; // Cookie key for authentication tokens

export let sessions = {};          // All currently logged-in Sessions

// Session-constructed objects represent an ongoing login session, including
// user details, login time, and time of last use, the latter for the purpose
// of timing-out sessions that have been unused for too long.
let Session = function(user) {
   this.username = user.Username;
   this.firstName = user.FirstName;
   this.lastName = user.LastName;
   this.email = user.Email;
   this.role = user.Role;
   this.canAdd = user.CanAdd;
   this.canApprove = user.CanApprove;
   this.canModify = user.CanModify;
   this.canArchive = user.CanArchive;
   this.canImport = user.CanImport;
   this.canExport = user.CanExport;
   this.loginTime = new Date().getTime();
   this.lastUsed = new Date().getTime();
};

Session.prototype.isAdmin = function() {
   return this.role === "Admin";
};

// Export a function that logs in |user| by creating an authToken and sending
// it back as a cookie, creating a Session for |user|, and saving it in
// |sessions| indexed by the authToken.
//
// 1 Cookie is tagged by |cookieName|, times out on the client side after
// |duration| shown by the browser to the user, again to prevent hacking.
export const makeSession = (user, res) => {
   let authToken = crypto.randomBytes(tokenLength).toString('hex');
   let session = new Session(user);

   res.cookie(cookieName, authToken, {maxAge: duration, httpOnly: true}); // 1
   sessions[authToken] = session;

   return authToken;
};

// Export a function to log out a user, given an authToken
export const deleteSession = (authToken) => {
   delete sessions[authToken];
};

// Export a router that will find any Session associated with |req|, based on
// cookies, delete the Session if it has timed out, or attach the Session to
// |req| if it's current If |req| has an attached Session after this
// process, then down-chain routes will treat |req| as logged-in.
export const router = (req, res, next) => {
   // If we present a session cookie that corresponds with one in |sessions|...
   if (req.cookies[cookieName] && sessions[req.cookies[cookieName]]) {
      // If the session was last used more than |duration| mS ago..
      if (sessions[req.cookies[cookieName]].lastUsed < new Date().getTime()
       - duration) {
         delete sessions[req.cookies[cookieName]];
      }
      else {
         req.session = sessions[req.cookies[cookieName]];
      }
   }
   next();
};

/**
 * Checks general login. If registering a user or logging in, continue with
 * processing the req, otherwise respond immediately with a 401 error.
 */
export const checkLogin = (req, res, next) => {
   console.log(req.path);
   if (req.session || (req.method === 'POST' &&
    (req.path === '/users/register' || req.path === '/sessions/login'))) {
      next();
   } else
      sendError(res,401, 'Not logged in');
};



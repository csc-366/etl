import express from 'express';

let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// TODO: Create user account
// TODO: Get User by ID
// TODO: Does username exist?
// TODO: Does email exist?
// TODO: Delete User
// TODO: Update user information (password, email, etc.)
// TODO: Approve user account
/*
 * TODO: Log user in
 *  - Generate Session Token
 *  - Remember, do NOT store secrets in plain text in this file!! Put it in .env and use process.env!!
 *  - Reject invalid username/password combo
 *  - Reject unapproved account?
*/

module.exports = router;

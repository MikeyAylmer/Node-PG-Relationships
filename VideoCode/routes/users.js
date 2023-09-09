/** Routes for users of pg-relationships-demo. */

const db = require("../db");
const express = require("express");
const router = express.Router();
const ExpressError = require("../expressError");



/** Get users: [user, user, user] */
router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT id, name, type FROM users`);

    return res.json(results.rows);
  }

  catch (err) {
    return next(err);
  }
});

// router.get('/:id', async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     // query to get user information
//     const userResults = await db.query(`SELECT name, type FROM users WHERE id = $1`, [id]);
//     // query to get messages information that corresponds to users info.
//     const msgResults = await db.query(`SELECT id, msg FROM messages WHERE user_id = $1`, [id]);
//     // error handler to check if id is valid.
//     if (userResults.rows.length === 0) {
//       throw new ExpressError("User not found", 404);
//     }
//     // object to grab first result of usersResults query.
//     const user = userResults.rows[0];
//     // set new propert messages equal to what we get back from msgResults query. 
//     user.messages = msgResults.rows;
//     return res.send(user)
//   } catch (e) {
//     return next(e)
//   }
// })

// refactored way with promise.all().
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    // Use Promise.all to execute both queries concurrently
    const [userResults, msgResults] = await Promise.all([
      db.query(`SELECT name, type FROM users WHERE id = $1`, [id]),
      db.query(`SELECT id, msg FROM messages WHERE user_id = $1`, [id])
    ]);

    // Check if the user is not found
    if (userResults.rows.length === 0) {
      throw new ExpressError("User not found", 404);
    }

    // Extract user data from the first query result
    const user = userResults.rows[0];

    // Attach messages to the user object
    user.messages = msgResults.rows;

    return res.send(user);
  } catch (e) {
    return next(e);
  }
});

/** Get user: {name, type, messages: [{msg, msg}]} */

module.exports = router;
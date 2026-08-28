const sql = require("mssql");
let pool;
async function getPool() {
  if (!pool) pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
  return pool;
}

module.exports = async function (context, req) {
  try {
    const db = await getPool();
    if (req.method === "GET") {
      const result = await db.request().query("SELECT id, title, done FROM Tasks ORDER BY id DESC");
      context.res = { body: result.recordset };
      return;
    }
    if (req.method === "POST") {
      const title = req.body && req.body.title;
      if (!title) {
        context.res = { status: 400, body: { error: "Missing 'title' in request body" } };
        return;
      }
      await db.request().input("title", sql.NVarChar, title).query("INSERT INTO Tasks (title, done) VALUES (@title, 0)");
      context.res = { body: { message: "Task added" } };
      return;
    }
    context.res = { status: 405, body: { error: "Method not allowed" } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: "Database error: " + err.message } };
  }
};
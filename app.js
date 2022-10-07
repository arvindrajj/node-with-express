const axios = require("axios");
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "user.db");

const fetch = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (e) {
    return e;
  }
};
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started at 3000 port");
    });
  } catch (e) {
    console.log(`Db Error ${e}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/api/users", async (req, res) => {
  let { page, limit, name, sort } = req.query;
  const ord = sort[0] === "-" ? "DESC" : "ASC";
  const orderBy = sort.slice(1);

  // const url =
  //   "https://datapeace-storage.s3-us-west-2.amazonaws.com/dummy_data/users.json";
  // const data = await fetch(url);

  const sqlQuery = `SELECT * FROM user 
   WHERE (first_name LIKE '%${name}%') OR (last_name LIKE '%${name}%')
   ORDER BY ${orderBy} ${ord}
   LIMIT ${limit} OFFSET ${page};`;
  const data = await db.all(sqlQuery);
  res.send(data);
  res.status(200);
  // data.forEach(async (each) => {
  //   const postUserQuery = `INSERT INTO user(id,first_name,last_name,company_name,city,state,zip,email,web,age) VALUES (?,?,?,?,?,?,?,?,?,?)`;
  //   await db.run(
  //     postUserQuery,
  //     [
  //       each.id,
  //       each.first_name,
  //       each.last_name,
  //       each.company_name,
  //       each.city,
  //       each.state,
  //       each.zip,
  //       each.email,
  //       each.web,
  //       each.age,
  //     ],
  //     (err) => {
  //       if (err) console.error(err);
  //       else console.log("success");
  //     }
  //   );
  // });
});

app.post("/api/users", async (req, res) => {
  const {
    id,
    first_name,
    last_name,
    company_name,
    city,
    state,
    zip,
    email,
    web,
    age,
  } = req.body;
  const postUserQuery = `
   INSERT INTO user(id, first_name, last_name, company_name, city, state, zip, email, web, age)
   values (${id}, '${first_name}', '${last_name}', '${company_name}', '${city}', '${state}', ${zip}, '${email}', '${web}', ${age});`;
  await db.run(postUserQuery);
  res.send("user created successfull");
  res.status(201);
});

app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  const sqlQuery = `SELECT * FROM user 
   WHERE id LIKE ${id};`;
  const data = await db.get(sqlQuery);
  res.send(data);
  res.status(200);
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, age } = req.body;
  const sqlQuery = `
   update user
   set
    first_name = '${first_name}',
    last_name = '${last_name}',
    age = ${age}
   where id like ${id};`;
  await db.run(sqlQuery);
  res.send("user updated");
  res.status(200);
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const sqlQuery = `
    delete from user
    where id like ${id};`;
  await db.run(sqlQuery);
  res.send("user deleted");
  res.status(200);
});

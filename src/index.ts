import { Client } from "pg";
import express from "express";

const app = express();
app.use(express.json());

const pgClient = new Client("postgresql://postgres:divy@localhost:5432/newlearn");

pgClient.connect();

app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;

    try {

        const insertQuery = `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id;`
        const addressQuery = `INSERT INTO addresses (city, country, street, pincode, user_id) VALUES ($1, $2, $3, $4, $5);`

        await pgClient.query("BEGIN;")

        const response = await pgClient.query(insertQuery, [username, email, password]);
        const userId = response.rows[0].id;
        const response2 = await pgClient.query(addressQuery, [city, country, street, pincode, userId]);

        await pgClient.query("COMMIT;")

        res.json({
            message: "you have signed up"
        })
    } catch (e) {
        console.log(e);
        res.json({
            message: "error while signing up"
        })
    }
})

app.get("/metadata", async (req, res) => {
    const id = req.query.id;
    const joinQuery = `SELECT u.id, u.username, u.email, a.city, a.country, a.street, a.pincode 
                       FROM users u 
                       RIGHT JOIN addresses a ON u.id = a.user_id 
                       WHERE u.id = $1;`
    const response = await pgClient.query(joinQuery, [id]);
    res.json({
        response: response.rows
    })
})

app.listen(3000);

import express from "express"
import bodyParser from "body-parser"
import pg from "pg"

const app = express()
const port = 3000
let visitedCountry_codes = []

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "postgre987",
    port: 5432,
})

db.connect()
    .then(() => console.log("Succesfully connected to Database"))
    .catch(() => console.log("Failed to connect to the Database"))

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

async function checkVisisted() {
    const result = await db.query("SELECT country_code FROM visited_countries");
    let countries = [];
    result.rows.forEach((country) => {
        countries.push(country.country_code);
    });
}

app.get("/", async (req, res) => {
    const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
})

app.post("/add", async (req, res) => {
    const requestedCountry = req.body.country
    try {
        const result = await db.query("SELECT country_code FROM countries  WHERE country_name LIKE '%' || $1 || '%' ", [
            requestedCountry.toLowerCase(),
        ])
        const data = result.rows[0]
        const countryCode = data.country_code
        try {
            await db.query(`INSERT INTO visited_countries (country_code) VALUES($1)`, [countryCode])
        } catch (err) {
            res.render("index", {
                countries: visitedCountry_codes,
                total: visitedCountry_codes.length,
                error: "Given country already added",
            })
        }
    } catch (err) {
        res.render("index", {
            countries: visitedCountry_codes,
            total: visitedCountry_codes.length,
            error: "Given country doesn't exist",
        })
    }
})
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

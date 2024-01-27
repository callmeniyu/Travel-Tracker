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

app.get("/", async (req, resp) => {
    db.query("SELECT country_code FROM visited_countries", (err, res) => {
        if (err) console.error("Failed to retrieve data", err.stack)
        else {
            res.rows.forEach((code) => {
                if(visitedCountry_codes.includes(code.country_code)) return
                visitedCountry_codes.push(code.country_code)
            })
        }
        resp.render("index", {
            countries: visitedCountry_codes,
            total: visitedCountry_codes.length,
        })
        console.log(visitedCountry_codes);
    })
})

app.post("/add", (req, resp) => {
    const requestedCountry = req.body.country
    db.query(`SELECT country_code FROM countries  WHERE country_name = '${requestedCountry}'`, (err, res) => {
        if (err) console.error("Error retrieving data from Countries", err.stack)
        else {
            const country_code = res.rows[0].country_code
            db.query(`INSERT INTO visited_countries (country_code) VALUES($1)`, [`${country_code}`], (err, res) => {
                if (err) console.error("Error inserting data to Visited", err.stack)
                else {
                    console.log(requestedCountry +" Country Succesfully Added")
                    resp.redirect("/")
                }
            })
        }
    })
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})

const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    "https://vercel-frontend-gqiaaml90-ravi-darwai-s-projects.vercel.app",
    "https://vercel-frontend-one-flax.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

/* Serve React frontend static files */
app.use(express.static(path.join(__dirname, "..", "public")))

/* SPA fallback: any unknown route serves index.html */
app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})


module.exports = app

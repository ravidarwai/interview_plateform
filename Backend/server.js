require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const dns = require("dns")

dns.setServers(["1.1.1.1", "4.4.4.4"])

connectToDB()

// Start the server only when this file is run directly (local/dev).
// On serverless platforms like Vercel the file will be `require`d,
// so we must NOT call `listen()` there. Export the Express `app`
// so the platform can invoke it as a handler.
if (require.main === module) {
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}

module.exports = app

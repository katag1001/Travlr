const express = require('express');
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

// ------------------------------
// Middleware
// ------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(require('cors')());

// ------------------------------
// DB Connection
// ------------------------------
async function connectingToDB() {
  try {
    await require("mongoose").connect(process.env.MONGO, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Connected to the DB ✅");
  } catch (error) {
    console.log("ERROR: Your DB is not running, start it up ☢️");
  }
}
connectingToDB();

// ------------------------------
// Routes
// ------------------------------
const allRoutes = require('./routes/routes.js');
app.use('/api', allRoutes); 

// ------------------------------
// Server Start
// ------------------------------
app.listen(port, () => {
  console.log("🚀 Listening on port: " + port + " 🚀");
});


// Author: JDM
// Created on: 2025-10-14T11:24:37.360Z

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const { sequelize } = require("../models/Models.js");
// const routes = require("../routes/Routes.js");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

// -------------------------------------------------------------------------------
// CORS CONFIGURATION
// -------------------------------------------------------------------------------
const DEVELOPMENT = false;
if (DEVELOPMENT) {
	app.use(
		cors({
			origin: "",
			credentials: true,
			optionSuccessStatus: 200,
		})
	);
} else {
	app.use(cors());
}

// -------------------------------------------------------------------------------
// APP MIDDLEWARE - INCREASED PAYLOAD LIMITS FOR DATABASE BACKUPS
// -------------------------------------------------------------------------------
// Increase limit to 50MB for large database backups
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "../client/build")));

// -------------------------------------------------------------------------------
// ALL ROUTES
// -------------------------------------------------------------------------------
router.get("/test", async (req, res) => {
	res.status(200).json("This is a test endpoint.");
});
router.get("/reset", async (req, res) => {
	await sequelize.sync({ force: true });
	res.send("Database reset successful.");
});
// router.use("/", routes);
router.use("/group", require("../routes/GroupRouter.js"));
router.use("/student", require("../routes/StudentRouter.js"));
router.use("/adviser", require("../routes/AdviserRouter.js"));
router.use("/student-account", require("../routes/StudentAccountRouter.js"));
router.use("/school-year", require("../routes/SchoolYearRouter.js"));
router.use("/student-grade", require("../routes/StudentGradeRouter.js"));

router.use("/backup", require("../routes/BackupRouter.js"));


// -------------------------------------------------------------------------------
// APP MIDDLEWARE
// -------------------------------------------------------------------------------

// Set base path for serverless functions
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);

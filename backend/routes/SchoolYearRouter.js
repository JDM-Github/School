// Author: JDM
// Created on: 2025-10-22T20:15:23.363Z

const express = require("express");
const { SchoolYear } = require("../models/Models");

class SchoolYearRouter {
    constructor() {
        this.router = express.Router();
        this.getRouter();
        this.postRouter();
    }

    getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const schoolyears = await SchoolYear.findAll({
					attributes: ["school_year"],
					order: [["school_year", "ASC"]], 
				});

				const schoolyearStrings = schoolyears.map(sy => sy.school_year);
				return res.json({
					success: true,
					message: "Successfully fetched all school years.",
					schoolyears: schoolyearStrings,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

    }

    postRouter() {}
}

module.exports = new SchoolYearRouter().router;

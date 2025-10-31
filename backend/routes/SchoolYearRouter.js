// Author: JDM
// Created on: 2025-10-22T20:15:23.363Z

const express = require("express");
const { SchoolYear, VisionMission } = require("../models/Models");

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
					order: [["school_year", "ASC"]], 
				});

				const schoolyearStrings = schoolyears.map(sy => sy.school_year);
				const schoolyearMap = {};
				schoolyears.forEach(sy => {
					schoolyearMap[sy.school_year] = {
						isGrade11Created: sy.isGrade11Created || false,
						isGrade12Created: sy.isGrade12Created || false,
						isPublished: sy.isPublished || false
					};
				});

				return res.json({
					success: true,
					message: "Successfully fetched all school years.",
					schoolyears: schoolyearStrings,
					schoolyearMap
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-vision-mission", async (req, res) => {
			try {
				const schoolyears = await SchoolYear.findAll({
					order: [["school_year", "ASC"]],
					attributes: ["school_year"],
				});

				const defaultVision =
					"To develop students into responsible, competent, and morally upright citizens equipped with 21st-century skills to thrive in an ever-changing global society.";
				const defaultMission =
					"Provide quality education that nurtures academic excellence and personal growth. Encourage critical thinking, creativity, and problem-solving skills among students. Foster values and discipline to produce responsible and ethical individuals. Promote inclusivity and collaboration within the school community. Utilize innovative teaching methods and technology to enhance learning outcomes.";

				const visionMissionMap = {};

				for (const { school_year } of schoolyears) {
					let vm = await VisionMission.findOne({ where: { school_year } });

					if (!vm) {
						vm = await VisionMission.create({
							school_year,
							vision: defaultVision,
							mission: defaultMission,
						});
					}

					visionMissionMap[school_year] = {
						vision: vm.vision,
						mission: vm.mission,
					};
				}

				return res.json({
					success: true,
					message: "Successfully fetched vision and mission data.",
					visionMission: visionMissionMap,
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

    postRouter() {
		this.router.post("/update-vision-mission", async (req, res) => {
			try {
				const { school_year, vision, mission } = req.body;

				if (!school_year)
					return res.status(400).json({
						success: false,
						message: "Missing school_year.",
					});

				const defaultVision =
					"To develop students into responsible, competent, and morally upright citizens equipped with 21st-century skills to thrive in an ever-changing global society.";
				const defaultMission =
					"Provide quality education that nurtures academic excellence and personal growth. Encourage critical thinking, creativity, and problem-solving skills among students. Foster values and discipline to produce responsible and ethical individuals. Promote inclusivity and collaboration within the school community. Utilize innovative teaching methods and technology to enhance learning outcomes.";

				let vm = await VisionMission.findOne({ where: { school_year } });

				if (!vm) {
					vm = await VisionMission.create({
						school_year,
						vision: vision || defaultVision,
						mission: mission || defaultMission,
					});
				} else {
					await vm.update({
						vision: vision ?? vm.vision,
						mission: mission ?? vm.mission,
					});
				}

				const schoolyears = await SchoolYear.findAll({
					order: [["school_year", "ASC"]],
					attributes: ["school_year"],
				});

				const visionMissionMap = {};
				for (const { school_year: sy } of schoolyears) {
					let record = await VisionMission.findOne({ where: { school_year: sy } });
					if (!record) {
						record = await VisionMission.create({
							school_year: sy,
							vision: defaultVision,
							mission: defaultMission,
						});
					}
					visionMissionMap[sy] = {
						vision: record.vision,
						mission: record.mission,
					};
				}

				return res.json({
					success: true,
					message: "Vision and mission updated successfully.",
					data: {
						school_year: vm.school_year,
						vision: vm.vision,
						mission: vm.mission,
					},
					visionMission: visionMissionMap,
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
}

module.exports = new SchoolYearRouter().router;

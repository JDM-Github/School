// Author: JDM
// Created on: 2025-10-26T09:44:57.376Z

const express = require("express");
const { Op } = require("sequelize");
const { StudentGrade, StudentAccount, Student, Section, Subject, Adviser, SHSSF9 } = require("../models/Models");

class StudentGradeRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const {
					schoolYear = "2024-2025",
					gradeLevel,
				} = req.query;

				const [currentStart, currentEnd] = schoolYear.split("-").map(Number);
				const nextSchoolYear = `${currentStart + 1}-${currentEnd + 1}`;

				const students1 = await Student.findAll({
					where: { school_year: schoolYear },
					include: [
						{ model: StudentAccount, as: "account" },
						{ model: Section, as: "section" },
					],
					order: [["id", "ASC"]],
				});

				const students2 = await Student.findAll({
					where: { school_year: nextSchoolYear },
					include: [
						{ model: StudentAccount, as: "account" },
						{ model: Section, as: "section" },
					],
					order: [["id", "ASC"]],
				});

				const students = [...students1, ...students2];

				const sectionIds = [...new Set(students.map(s => s.section_id).filter(Boolean))];
				const advisers = await Adviser.findAll({
					where: {
						handle_section_id: { [Op.in]: sectionIds },
						school_year: schoolYear,
					},
				});

				const adviserMap = Object.fromEntries(advisers.map(a => [a.handle_section_id, a]));

				const shssf9Ids = advisers.map(a => a.shs_sf9_id).filter(Boolean);
				const shssf9Records = await SHSSF9.findAll({
					where: { id: { [Op.in]: shssf9Ids } },
				});

				const shssf9Map = Object.fromEntries(shssf9Records.map(r => [r.id, r]));

				const studentGrades = await StudentGrade.findAll({
					include: [{ model: Subject, as: "subject" }],
				});

				const gradeMap = Object.fromEntries(studentGrades.map((g) => [g.id, g]));
				const subjectMap = Object.fromEntries(
					studentGrades.map((g) => [g.subject_id, g.subject])
				);

				const result = students.reduce((newAcc, student) => {
					const acc = student.account || {};

					const subjGrades =
						student.subject_grade_ids
							?.map((id) => gradeMap[id])
							.filter(Boolean)
							.map((sg) => {
								const subject = subjectMap[sg.subject_id];
								const q1 = Number(sg.first_quarter);
								const q2 = Number(sg.second_quarter);
								const q3 = Number(sg.third_quarter);
								const q4 = Number(sg.final_quarter);

								const format = (v) => (v === 0 ? "-" : v);

								const final =
									q1 && q2 && q3 && q4
										? Math.round((q1 + q2 + q3 + q4) / 4)
										: "-";

								return {
									subject: subject?.name || "Unknown",
									grades: {
										first: format(q1),
										second: format(q2),
										third: format(q3),
										fourth: format(q4),
									},
									final,
								};
							}) || [];

					const hasIncomplete = subjGrades.some((s) => s.final === "-");

					let status;
					if (subjGrades.length === 0) status = "-";
					else if (hasIncomplete) status = "-";
					else if (subjGrades.every((s) => s.final >= 75)) status = "Passed";
					else status = "Failed";

					const enrolledNext = student.account.isEnrollThisSY || false;

					const adviser = adviserMap[student.section_id];
					const shssf9 = adviser ? shssf9Map[adviser.shs_sf9_id] : null;

					if (shssf9 && shssf9.current_status !== "COMPLETED") {
						status = "Pending Finalization";
					}
					const passed = status === "Passed";

					if (student.school_year !== schoolYear) {
						if (student.isNew && student.startedSY === schoolYear) {
							newAcc.push({
								id: student.id,
								name: acc.name,
								grade_level: student.grade_level || acc.gradeLevel,
								section: student.section?.section_name || "Unassigned",
								subjects: subjGrades,
								status,
								enrolledNext,
								isGraduated: student.account.graduated,
								passed,
								isNew: true,
							});
						}
						return newAcc;
					}

					newAcc.push({
						id: student.id,
						name: acc.name,
						grade_level: student.grade_level || acc.gradeLevel,
						section: student.section?.section_name || "Unassigned",
						subjects: subjGrades,
						status,
						enrolledNext,
						isGraduated: student.account.graduated,
						passed,
						isNew: false,
					});

					return newAcc;
				}, []);

				return res.json({
					success: true,
					message: "Successfully fetched student grades.",
					total: result.length,
					students: result,
				});
			} catch (err) {
				console.error("❌ Error fetching student grades:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});



	}

	postRouter() {
		this.router.post("/update-enrolled", async (req, res) => {
			try {
				const { student_id } = req.body;

				if (!student_id) {
					return res.status(400).json({
						success: false,
						message: "Missing student_id in request body.",
					});
				}

				const student = await Student.findByPk(student_id, {
					include: [{ model: StudentAccount, as: "account" }],
				});

				if (!student) {
					return res.status(404).json({
						success: false,
						message: "Student not found.",
					});
				}

				if (!student.account) {
					return res.status(404).json({
						success: false,
						message: "Student account not found.",
					});
				}

				const currentValue = student.account.isEnrollThisSY;
				const newValue = !currentValue;
				await StudentAccount.update({ isEnrollThisSY: newValue }, { where: { id: student.account.id } });
				return res.json({
					success: true,
					message: `Student enrollment status updated to ${newValue ? "Enrolled" : "Not Enrolled"}.`,
					data: { student_id, isEnrollThisSY: newValue },
				});
			} catch (err) {
				console.error("❌ Error updating enrollment status:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

	}
}

module.exports = new StudentGradeRouter().router;

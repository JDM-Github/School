const express = require("express");
const bcrypt = require('bcryptjs');
const { Op } = require("sequelize");
const { StudentAccount, Student, Section, Attendance, Subject, SubjectAttendance, Adviser, AdviserAccount, StudentGrade, SchoolYear } = require("../models/Models");

class StudentRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const {
					page = 1,
					limit = 30,
					currentSchoolYear = "2024-2025",
					attendanceOnly,
					viewType,
					section,
					subject,
					adviser,
				} = req.query;

				const offset = (page - 1) * limit;

				const include = [
					{ model: Section, as: "section" },
					{ model: StudentAccount, as: "account" },
					{ model: Attendance, as: "attendance" },
				];

				let where = { school_year: currentSchoolYear, isStartedSY: true };
				if (viewType && viewType !== "ALL") {
					where.grade_level = viewType;
				}

				if (section && section !== "ALL") {
					const sectionRecord = await Section.findOne({ where: { section_name: section } });
					if (sectionRecord) {
						where.section_id = sectionRecord.id;
					} else {
						return res.json({
							success: true,
							page: parseInt(page),
							limit: parseInt(limit),
							total: 0,
							students: [],
						});
					}
				}

				const advisers = await Adviser.findAll({
					where: { school_year: currentSchoolYear },
					include: [{ model: AdviserAccount, as: "account" }],
				});

				const adviserMap = Object.fromEntries(
					advisers.map((a) => [a.handle_section_id, a])
				);

				if (adviser && adviser !== "ALL") {
					const adviserRecord = advisers.find(
						(a) =>
							a.account?.name?.toLowerCase() === adviser.toLowerCase() ||
							a.account?.email?.toLowerCase() === adviser.toLowerCase()
					);
					if (adviserRecord) {
						where.section_id = adviserRecord.handle_section_id;
					} else {
						return res.json({
							success: true,
							page: parseInt(page),
							limit: parseInt(limit),
							total: 0,
							students: [],
						});
					}
				}
				const totalStudents = await Student.count({ where });

				const students = await Student.findAll({
					include,
					where,
					limit: parseInt(limit),
					offset: parseInt(offset),
					order: [["id", "ASC"]],
				});

				let subjectsMap = {};
				let subjectAttendancesMap = {};

				if (attendanceOnly !== "true") {
					const subjects = await Subject.findAll();
					subjectsMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

					const subjectAttendances = await SubjectAttendance.findAll({
						include: [{ model: Subject, as: "subject" }],
					});
					subjectAttendancesMap = Object.fromEntries(subjectAttendances.map((sa) => [sa.id, sa]));
				}

				let result = students.map((s) => {
					const studentData = s.toJSON();

					if (attendanceOnly !== "true") {
						studentData.subjects = s.subjects_ids.map((id) => subjectsMap[id]).filter(Boolean);
						studentData.attendance = {
							...studentData.attendance,
							subjectAttendances:
								studentData.attendance?.subject_attendance_ids
									?.map((id) => subjectAttendancesMap[id])
									.filter(Boolean) || [],
						};
					}

					const adviserInfo = adviserMap[s.section_id];
					if (adviserInfo) {
						studentData.adviser_name = adviserInfo.account.name;
					} else {
						studentData.adviser = null;
					}

					return studentData;
				});

				if (subject && subject !== "ALL") {
					result = result.filter((student) =>
						student.subjects?.some((sub) => sub?.name === subject)
					);
				}

				return res.json({
					success: true,
					message: "Successfully fetched students with advisers and filters.",
					page: parseInt(page),
					limit: parseInt(limit),
					total: totalStudents,
					students: result,
				});
			} catch (err) {
				console.error("❌ Error fetching students:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-all-by-sy", async (req, res) => {
			try {
				const { currentSchoolYear = "2024-2025" } = req.query;
				const totalStudents = await Student.count({
					where: { school_year: currentSchoolYear, isStartedSY: true },
				});

				const students = await Student.findAll({
					where: { school_year: currentSchoolYear, isStartedSY: true },
					include: [
						{ model: Section, as: "section" },
						{ model: StudentAccount, as: "account" },
						{ model: Attendance, as: "attendance" },
					],
					order: [["id", "ASC"]],
				});

				const allGrades = await StudentGrade.findAll();
				const gradesMap = Object.fromEntries(allGrades.map((g) => [g.id, g]));
				const allSubjectAttendances = await SubjectAttendance.findAll({
					include: [{ model: Subject, as: "subject" }],
				});
				const subjectAttendanceMap = Object.fromEntries(
					allSubjectAttendances.map((sa) => [sa.id, sa])
				);

				const result = students.map((s) => {
					const studentData = s.toJSON();
					studentData.subjectGrades = studentData.subject_grade_ids
						?.map((id) => gradesMap[id])
						.filter(Boolean) || [];

					studentData.subjectAttendances = studentData.attendance?.subject_attendance_ids
						?.map((id) => subjectAttendanceMap[id])
						.filter(Boolean) || [];

					return studentData;
				});

				return res.json({
					success: true,
					message: `Fetched all students with attendance, subject attendance, and grades for SY ${currentSchoolYear}`,
					total: totalStudents,
					students: result,
				});
			} catch (err) {
				console.error("❌ Error fetching students by SY:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});





		this.router.get("/get-dashboard-data", async (req, res) => {
			try {
				const {
					page = 1,
					limit = 30,
					currentSchoolYear = "2024-2025",
					attendanceOnly,
					viewType,
					section,
					subject,
					adviser,
				} = req.query;

				const offset = (page - 1) * limit;

				const include = [
					{ model: Section, as: "section" },
					{ model: StudentAccount, as: "account" },
					{ model: Attendance, as: "attendance" },
				];

				let where = { school_year: currentSchoolYear, isStartedSY: true };
				if (viewType && viewType !== "ALL") {
					where.grade_level = viewType;
				}

				if (section && section !== "ALL") {
					const sectionRecord = await Section.findOne({ where: { section_name: section } });
					if (sectionRecord) {
						where.section_id = sectionRecord.id;
					} else {
						return res.json({
							success: true,
							page: parseInt(page),
							limit: parseInt(limit),
							total: 0,
							students: [],
						});
					}
				}

				const advisers = await Adviser.findAll({
					where: { school_year: currentSchoolYear },
					include: [{ model: AdviserAccount, as: "account" }],
				});

				const adviserMap = Object.fromEntries(
					advisers.map((a) => [a.handle_section_id, a])
				);

				if (adviser && adviser !== "ALL") {
					const adviserRecord = advisers.find(
						(a) =>
							a.account?.name?.toLowerCase() === adviser.toLowerCase() ||
							a.account?.email?.toLowerCase() === adviser.toLowerCase()
					);
					if (adviserRecord) {
						where.section_id = adviserRecord.handle_section_id;
					} else {
						return res.json({
							success: true,
							page: parseInt(page),
							limit: parseInt(limit),
							total: 0,
							students: [],
						});
					}
				}
				const totalStudents = await Student.count({ where });

				const students = await Student.findAll({
					include,
					where,
					limit: parseInt(limit),
					offset: parseInt(offset),
					order: [["id", "ASC"]],
				});

				let subjectsMap = {};
				let subjectAttendancesMap = {};

				if (attendanceOnly !== "true") {
					const subjects = await Subject.findAll();
					subjectsMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

					const subjectAttendances = await SubjectAttendance.findAll({
						include: [{ model: Subject, as: "subject" }],
					});
					subjectAttendancesMap = Object.fromEntries(subjectAttendances.map((sa) => [sa.id, sa]));
				}

				let result = students.map((s) => {
					const studentData = s.toJSON();

					if (attendanceOnly !== "true") {
						studentData.subjects = s.subjects_ids.map((id) => subjectsMap[id]).filter(Boolean);
						studentData.attendance = {
							...studentData.attendance,
							subjectAttendances:
								studentData.attendance?.subject_attendance_ids
									?.map((id) => subjectAttendancesMap[id])
									.filter(Boolean) || [],
						};
					}

					const adviserInfo = adviserMap[s.section_id];
					if (adviserInfo) {
						studentData.adviser_name = adviserInfo.account.name;
					} else {
						studentData.adviser = null;
					}

					return studentData;
				});

				if (subject && subject !== "ALL") {
					result = result.filter((student) =>
						student.subjects?.some((sub) => sub?.name === subject)
					);
				}

				return res.json({
					success: true,
					message: "Successfully fetched students with advisers and filters.",
					page: parseInt(page),
					limit: parseInt(limit),
					total: totalStudents,
					students: result,
				});
			} catch (err) {
				console.error("❌ Error fetching students:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/kpi2", async (req, res) => {
			try {
				const students = await Student.findAll({
					where: { school_year: "2026-2027" },
				});
				return res.json({
					success: true,
					message: "KPI data fetched successfully",
					students
				});
			} catch (err) {
				console.error("❌ Error fetching KPI data:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});

		this.router.get("/kpi", async (req, res) => {
			try {
				const { currentSchoolYear = "2024-2025" } = req.query;
				const [currentStart, currentEnd] = currentSchoolYear.split("-").map(Number);
				const previousSchoolYear = `${currentStart - 1}-${currentEnd - 1}`;

				const totalStudents = await Student.count({
					where: { school_year: currentSchoolYear, isStartedSY: true },
				});

				const age1617Students = await Student.count({
					where: {
						school_year: currentSchoolYear, isStartedSY: true,
						"$account.age$": { [Op.in]: [16, 17] },
					},
					include: [{ model: StudentAccount, as: "account" }],
				});

				const projectedPopulation = 200; 
				const dropouts = await Student.count({
					where: { school_year: currentSchoolYear, isStartedSY: true },
					include: [
						{
							model: StudentAccount,
							as: "account",
							where: { status: "dropout" },
						},
					],
				});

				const bosyPrev = await Student.count({
					where: { school_year: previousSchoolYear, isStartedSY: true },
				});
				const bosyCurr = totalStudents;
				const repeatersPrev = await Student.count({
					where: { school_year: previousSchoolYear, isStartedSY: true },
					include: [{ model: StudentAccount, as: "account", where: { isRepeater: true } }],
				});
				const repeatersCurr = await Student.count({
					where: { school_year: currentSchoolYear, isStartedSY: true },
					include: [{ model: StudentAccount, as: "account", where: { isRepeater: true } }],
				});
				const leaverRate = bosyCurr > 0
					? (((bosyPrev - repeatersPrev) - (bosyCurr - repeatersCurr)) / bosyCurr * 100).toFixed(2)
					: "0.00";

				const bosyG12 = await Student.count({
					where: { school_year: currentSchoolYear, isStartedSY: true, grade_level: "Grade 12" },
				});
				const graduates = await Student.count({
					where: { school_year: currentSchoolYear, isStartedSY: true, grade_level: "Grade 12" },
					include: [{ model: StudentAccount, as: "account", where: { graduated: true } }],
				});

				const gradRate = bosyG12 > 0
					? ((graduates / bosyG12) * 100).toFixed(2)
					: "0.00";

				return res.json({
					success: true,
					message: "KPI data fetched successfully",
					kpi: {
						enrollment: {
							bosyTotal: totalStudents,
							bosyAge1617: age1617Students,
							projected: projectedPopulation,
						},
						dropout: {
							dropOut: dropouts,
							bosy: totalStudents,
						},
						leaver: {
							bosyPrev,
							bosyCurr,
							repeatersPrev,
							repeatersCurr,
							leaverRate,
						},
						graduation: {
							graduates,
							bosyG12,
							gradRate,
						},
					},
				});
			} catch (err) {
				console.error("❌ Error fetching KPI data:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});
	}

	postRouter() {
		this.router.post("/new-enrollee", async (req, res) => {
			try {
				const {
					firstName,
					middleName,
					lastName,
					suffix,
					age,
					sex,
					email,
					gradeLevel,
					currentSY,
				} = req.body;

				let newSY = currentSY;
				const schoolYears = await SchoolYear.findAll();
				if (schoolYears.length) {
					const lastYear = schoolYears[schoolYears.length - 1];
					if (lastYear.isPublished) {
						const [currentStart, currentEnd] = currentSY.split("-").map(Number);
						const nextSchoolYear = `${currentStart + 1}-${currentEnd + 1}`;
						newSY = nextSchoolYear;
					} else {
						if (gradeLevel === "Grade 11" && lastYear.isGrade11Created) {
							return res.json({
								success: false,
								message: "Cannot add new enrollee, Grade 11 school year is already created.",
							});
						}
						if (gradeLevel === "Grade 12" && lastYear.isGrade12Created) {
							return res.json({
								success: false,
								message: "Cannot add new enrollee, Grade 12 school year is already created.",
							});
						}
						newSY = lastYear.school_year;
					}
				}

				const nameParts = [firstName, middleName, lastName, suffix].filter(Boolean);
				const name = nameParts.join(" ");
				const password = await bcrypt.hash("123", 10);
				const account = await StudentAccount.create({
					name,
					firstName,
					middleName,
					lastName,
					suffix,
					age,
					sex,
					email,
					password,
					graduated: false,
					status: gradeLevel === "Grade 12" ? "transferred" : "active",
					isRepeater: false,
					retained: true,
					gradeLevel,
					currentSY: newSY,
					isEnrollThisSY: true,
					isPassedThisSY: false,
					isNew: true,
				});

				await Student.create({
					student_account_id: account.id,
					section_id: null,
					attendance_id: null,
					grade_level: gradeLevel,
					subject_grade_ids: [],
					subjects_ids: [],
					school_year: account.currentSY,
					isNew: true,
					isStartedSY: false,
					startedSY: newSY,
				});

				return res.json({
					success: true,
					message: "New enrollee created successfully.",
					studentId: account.id,
				});
			} catch (err) {
				console.error("❌ Error creating new enrollee:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});

		this.router.post("/upload-enrollees", async (req, res) => {
			try {
				const { rows, currentSY } = req.body;
				const [currentStart, currentEnd] = currentSY.split("-").map(Number);
				const nextSchoolYear = `${currentStart + 1}-${currentEnd + 1}`;

				for (const row of rows) {
					const { firstName, middleName, lastName, suffix, age, sex, email, gradeLevel } = row;
					const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
					const exists = await StudentAccount.findOne({
						where: {
							[Op.or]: [
								{ email },
								{ name: fullName }
							]
						}
					});
					if (exists) continue;
					const password = await bcrypt.hash(`${lastName}${firstName}${age}`, 10);
					const account = await StudentAccount.create({
						name: fullName,
						firstName, middleName, lastName, suffix,
						age, sex, email, password,
						graduated: false,
						status: gradeLevel === "Grade 12" ? "transferred" : "active",
						isRepeater: false,
						retained: true,
						gradeLevel,
						currentSY: nextSchoolYear,
						isEnrollThisSY: true,
						isPassedThisSY: false,
						isNew: true,
					});

					await Student.create({
						student_account_id: account.id,
						section_id: null,
						attendance_id: null,
						grade_level: gradeLevel,
						subject_grade_ids: [],
						subjects_ids: [],
						school_year: account.currentSY,
						isNew: true,
						isStartedSY: false,
						startedSY: currentSY,
					});
				}

				res.json({ success: true, message: "Enrollees uploaded successfully." });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});
	}
}

module.exports = new StudentRouter().router;

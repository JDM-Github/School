// Author: JDM
// Created on: 2025-10-21T21:05:48.497Z

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Adviser, AdviserAccount, Section, SHSSF9, SHSSF2, SubjectStatus, Subject, Student, StudentAccount, StudentGrade, Attendance, SubjectAttendance, SchoolYear } = require("../models/Models");
const { Op } = require("sequelize");

class AdviserRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
	}

	getRouter() {

		this.router.get("/get-all", async (req, res) => {
			try {
				const advisers = await Adviser.findAll({
					include: [
						{ model: AdviserAccount, as: "account" },
						{ model: Section, as: "section" },
						{ model: SHSSF9, as: "shsSf9" },
						{ model: SHSSF2, as: "shsSf2" },
					],
				});
				const advisersWithSubjects = await Promise.all(
					advisers.map(async adv => {
						const advJSON = adv.toJSON();

						if (advJSON.shsSf9?.subject_status_ids?.length) {
							advJSON.subjectStatuses = await SubjectStatus.findAll({
								where: { id: { [Op.in]: advJSON.shsSf9.subject_status_ids } },
								include: [{ model: Subject, as: "subject" }],
							});
						} else {
							advJSON.subjectStatuses = [];
						}

						return advJSON;
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched all advisers with full details.",
					advisers: advisersWithSubjects,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-subjects-by-adviser-account/:accountId", async (req, res) => {
			try {
				const { accountId } = req.params;
				const { school_year = "2025-2026" } = req.query;

				const advisers = await Adviser.findAll({
					where: {
						adviser_id: accountId,
						school_year,
					},
					include: [
						{ model: AdviserAccount, as: "account" },
						{ model: Section, as: "section" },
						{ model: SHSSF9, as: "shsSf9" },
					],
				});

				if (!advisers.length) {
					return res.status(404).json({
						success: false,
						message: "No adviser found for this account in the given school year.",
					});
				}

				const results = await Promise.all(
					advisers.map(async (adv) => {
						const advJSON = adv.toJSON();
						const handleSubjectIds = advJSON.handle_subject_ids || [];
						const sf9SubjectStatusIds = advJSON.shsSf9?.subject_status_ids || [];

						let subjects = [];
						if (handleSubjectIds.length > 0) {
							const subjectRecords = await Subject.findAll({
								where: { id: { [Op.in]: handleSubjectIds } },
							});

							let subjectStatuses = [];
							if (sf9SubjectStatusIds.length > 0) {
								subjectStatuses = await SubjectStatus.findAll({
									where: { id: { [Op.in]: sf9SubjectStatusIds } },
									include: [{ model: Subject, as: "subject" }],
								});
							}

							subjects = subjectRecords.map((subject) => {
								const matchingStatus = subjectStatuses.find(
									(st) => st.subject_id === subject.id
								);
								return {
									id: subject.id,
									name: subject.name,
									specialized_category: subject.specialized_category,
									status: matchingStatus
										? matchingStatus.is_completed
											? "COMPLETE"
											: matchingStatus.is_incomplete
												? "INCOMPLETE"
												: "NO INPUT"
										: "NO INPUT",
								};
							});
						}

						return {
							adviser_id: advJSON.id,
							account_id: advJSON.adviser_id,
							school_year: advJSON.school_year,
							program: advJSON.program || "N/A",
							section: advJSON.section?.section_name || "N/A",
							adviser_name: `${advJSON.account.firstName} ${advJSON.account.middleName?.charAt(0) + "." || ""} ${advJSON.account.lastName}`,
							current_status: advJSON.shsSf9?.current_status || "NO INPUT",
							subjects,
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched subjects with SHS SF9 status by adviser account.",
					data: results,
				});
			} catch (err) {
				console.error("❌ Error fetching subjects by adviser account:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-students-by-adviser-account/:accountId", async (req, res) => {
			try {
				const { accountId } = req.params;
				const { school_year = "2025-2026" } = req.query;

				const advisers = await Adviser.findAll({
					where: { adviser_id: accountId, school_year },
					include: [
						{ model: AdviserAccount, as: "account" },
						{ model: Section, as: "section" },
						{ model: SHSSF9, as: "shsSf9" },
						{ model: SHSSF2, as: "shsSf2" },
					],
				});

				if (!advisers.length) {
					return res.status(404).json({
						success: false,
						message: "No adviser found for this account in the given school year.",
					});
				}

				const results = await Promise.all(
					advisers.map(async (adv) => {
						if (!adv.handle_section_id) {
							return {
								adviser_id: adv.id,
								school_year: adv.school_year,
								section: "N/A",
								adviser_name: `${adv.account.firstName} ${adv.account.middleName?.charAt(0) + "." || ""} ${adv.account.lastName}`,
								students: [],
							};
						}

						const students = await Student.findAll({
							where: { section_id: adv.handle_section_id, school_year },
							include: [{ model: StudentAccount, as: "account" }],
						});

						const studentList = await Promise.all(
							students.map(async (s) => {
								const subjectGradeIds = s.subject_grade_ids || [];
								let grades = [];
								if (subjectGradeIds.length > 0) {
									grades = await StudentGrade.findAll({
										where: { id: { [Op.in]: subjectGradeIds } },
										include: [{ model: Subject, as: "subject" }],
									});
								}

								const formattedGrades = grades.map((g) => ({
									subject_id: g.subject_id,
									subject_name: g.subject?.name || "Unknown Subject",
									first_quarter: g.first_quarter,
									second_quarter: g.second_quarter,
									third_quarter: g.third_quarter,
									final_quarter: g.final_quarter,
								}));

								let formattedAttendance = [];
								if (s.attendance_id) {
									const attendance = await Attendance.findByPk(s.attendance_id);
									if (attendance && attendance.subject_attendance_ids?.length > 0) {
										const subjectAttendances = await SubjectAttendance.findAll({
											where: { id: { [Op.in]: attendance.subject_attendance_ids } },
											include: [{ model: Subject, as: "subject" }],
										});

										formattedAttendance = subjectAttendances.map((sa) => ({
											subject_id: sa.subject_id,
											subject_name: sa.subject?.name || "Unknown Subject",
											months: {
												january: sa.january,
												february: sa.february,
												march: sa.march,
												april: sa.april,
												may: sa.may,
												june: sa.june,
												july: sa.july,
												august: sa.august,
												september: sa.september,
												october: sa.october,
												november: sa.november,
												december: sa.december,
											},
										}));
									}
								}

								

								return {
									id: s.id,
									name: `${s.account.firstName} ${s.account.middleName?.charAt(0) + "." || ""} ${s.account.lastName}`,
									sex: s.account.sex,
									age: s.account.age,
									grade_level: s.grade_level,
									status: s.account.status,
									email: s.account.email,
									isRepeater: s.account.isRepeater,
									retained: s.account.retained,
									isPassedThisSY: s.account.isPassedThisSY,
									isEnrollThisSY: s.account.isEnrollThisSY,
									grades: formattedGrades,
									attendance: formattedAttendance,
								};
							})
						);

						const sf2 = adv.shsSf2
							? {
								january_status: adv.shsSf2.january_status,
								february_status: adv.shsSf2.february_status,
								march_status: adv.shsSf2.march_status,
								april_status: adv.shsSf2.april_status,
								may_status: adv.shsSf2.may_status,
								june_status: adv.shsSf2.june_status,
								july_status: adv.shsSf2.july_status,
								august_status: adv.shsSf2.august_status,
								september_status: adv.shsSf2.september_status,
								october_status: adv.shsSf2.october_status,
								november_status: adv.shsSf2.november_status,
								december_status: adv.shsSf2.december_status,
							}
							: null;
						
						let formattedSubjectStatuses = [];
						if (adv.shsSf9 && adv.shsSf9.subject_status_ids?.length > 0) {
							const subjectStatuses = await SubjectStatus.findAll({
								where: { id: { [Op.in]: adv.shsSf9.subject_status_ids } },
								include: [{ model: Subject, as: "subject" }],
							});

							formattedSubjectStatuses = subjectStatuses.map((st) => ({
								subject_id: st.subject_id,
								subject_name: st.subject?.name || "Unknown Subject",
								status: st.is_completed
									? "COMPLETED"
									: st.is_incomplete
										? "INCOMPLETE"
										: "NO INPUT",
							}));
						}

						// PUT THE SHSSF9 subject status here
						return {
							adviser_id: adv.id,
							account_id: adv.adviser_id,
							school_year: adv.school_year,
							program: adv.program || "N/A",
							section: adv.section?.section_name || "N/A",
							adviser_name: `${adv.account.firstName} ${adv.account.middleName?.charAt(0) + "." || ""} ${adv.account.lastName}`,
							current_status: adv.shsSf9?.current_status || "NO INPUT",
							shsf2_status: sf2,
							total_students: studentList.length,
							male_students: studentList.filter((s) => s.sex === "Male").length,
							female_students: studentList.filter((s) => s.sex === "Female").length,
							students: studentList,
							formattedSubjectStatuses
						};
					})
				);

				return res.json({
					success: true,
					message: "Successfully fetched all students under adviser with grades, attendance, SHSF9, and SHSF2 data.",
					data: results,
				});
			} catch (err) {
				console.error("❌ Error fetching students by adviser account:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-all-with-student-counts", async (req, res) => {
			try {
				const { school_year = "2024-2025" } = req.query;
				const advisers = await Adviser.findAll({
					where: { school_year },
					include: [
						{ model: AdviserAccount, as: "account" },
						{ model: Section, as: "section" },
						{ model: SHSSF9, as: "shsSf9" },
					],
				});

				const advisersWithDetails = await Promise.all(
					advisers.map(async (adv) => {
						const advJSON = adv.toJSON();

						if (advJSON.shsSf9?.subject_status_ids?.length) {
							advJSON.subjectStatuses = await SubjectStatus.findAll({
								where: { id: { [Op.in]: advJSON.shsSf9.subject_status_ids } },
								include: [{ model: Subject, as: "subject" }],
							});
						} else {
							advJSON.subjectStatuses = [];
						}

						if (!advJSON.handle_section_id) {
							advJSON.subjectStatuses = [];
							advJSON.studentCounts = {
								total: 0,
								male: 0,
								female: 0,
							};
							advJSON.grade_level = "NONE";
							advJSON.section = null;
							return advJSON;
						}

						const students = await Student.findAll({
							where: {
								section_id: advJSON.handle_section_id,
								school_year: advJSON.school_year,
							},
							include: [{ model: StudentAccount, as: "account" }],
						});

						if (students.length === 0) {
							advJSON.subjectStatuses = [];
							advJSON.studentCounts = {
								total: 0,
								male: 0,
								female: 0,
							};
							advJSON.grade_level = "NONE";
							advJSON.section = null;
							return advJSON;
						}

						let maleStudentsCount = 0;
						let femaleStudentsCount = 0;
						students.forEach((s) => {
							if (s.account?.sex === "Male") maleStudentsCount++;
							else if (s.account?.sex === "Female") femaleStudentsCount++;
						});
						advJSON.studentCounts = {
							total: students.length,
							male: maleStudentsCount,
							female: femaleStudentsCount,
						};
						advJSON.grade_level = students[0].grade_level;
						console.log(advJSON);
						return advJSON;
					})
				);
				const filteredAdvisers = advisersWithDetails.filter(Boolean);
				return res.json({
					success: true,
					message: "Successfully fetched all advisers with student counts by sex.",
					advisers: filteredAdvisers,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-all-shs-sf2-summary", async (req, res) => {
			try {
				const { school_year = "2024-2025" } = req.query;
				const advisers = await Adviser.findAll({
					where: { school_year },
					include: [
						{ model: AdviserAccount, as: "account" },
						{ model: Section, as: "section" },
						{ model: SHSSF2, as: "shsSf2" },
					],
				});

				const summary = await Promise.all(
					advisers.map(async (adv) => {
						const advJSON = adv.toJSON();

						if (!advJSON.handle_section_id) return null;							
						const students = await Student.findAll({
							where: {
								section_id: advJSON.handle_section_id,
								school_year, 
							},
							include: [{ model: StudentAccount, as: "account" }],
						});

						if (students.length === 0) return null;

						const gradeLevel = students[0].grade_level;

						const sectionName = advJSON.section?.section_name || "Unknown Section";
						const adviserName = advJSON.account
							? `${advJSON.account.firstName} ${advJSON.account.middleName?.charAt(0) + "." || ""} ${advJSON.account.lastName}`.trim()
							: "Unknown Adviser";

						const sf2 = advJSON.shsSf2 || {};
						const months = [
							sf2.june_status || "NOT ENCODED",
							sf2.july_status || "NOT ENCODED",
							sf2.august_status || "NOT ENCODED",
							sf2.september_status || "NOT ENCODED",
							sf2.october_status || "NOT ENCODED",
							sf2.november_status || "NOT ENCODED",
							sf2.december_status || "NOT ENCODED",
							sf2.january_status || "NOT ENCODED",
							sf2.february_status || "NOT ENCODED",
							sf2.march_status || "NOT ENCODED",
							sf2.april_status || "NOT ENCODED",
							sf2.may_status || "NOT ENCODED",
						];

						return {
							section: sectionName,
							program: advJSON.program || "N/A",
							grade_level: gradeLevel,
							adviser: adviserName,
							months,
						};
					})
				);

				const filteredSummary = summary.filter(Boolean);

				return res.json({
					success: true,
					message: "Successfully fetched SHS SF2 summary per adviser/section.",
					data: filteredSummary,
				});
			} catch (err) {
				console.error("❌ Error fetching SHS SF2 summary:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.get("/get-all-shs-sf9-summary", async (req, res) => {
			try {
				const { school_year = "2024-2025" } = req.query;

				const advisers = await Adviser.findAll({
					where: { school_year },
					include: [
						{ model: AdviserAccount, as: "account" },
						{ model: Section, as: "section" },
						{ model: SHSSF9, as: "shsSf9" },
					],
				});


				const summary = await Promise.all(
					advisers.map(async (adv) => {
						const advJSON = adv.toJSON();

						let subjectStatuses = [];
						if (advJSON.shsSf9?.subject_status_ids?.length) {
							subjectStatuses = await SubjectStatus.findAll({
								where: { id: { [Op.in]: advJSON.shsSf9.subject_status_ids } },
								include: [{ model: Subject, as: "subject" }],
							});
						}
						const adviserName = advJSON.account
							? `${advJSON.account.firstName} ${advJSON.account.middleName?.charAt(0) + "." || ""} ${advJSON.account.lastName}`.trim()
							: "Unknown Adviser";

						if (!advJSON.handle_section_id) {
							// return {
							// 	grade_level: "NOT SET",
							// 	section: advJSON.section?.section_name || "Unknown Section",
							// 	program: advJSON.program || "N/A",
							// 	adviser: adviserName,
							// 	male: 0,
							// 	female: 0,
							// 	total: 0,
							// 	completedSubjects: 0,
							// 	incompleteSubjects: 0,
							// 	totalSubjects: 0,
							// 	notEncoded: 0,
							// 	status: "NO INPUT",
							// };
							return null
						};

						const students = await Student.findAll({
							where: {
								section_id: advJSON.handle_section_id,
								school_year,
							},
							include: [{ model: StudentAccount, as: "account" }],
						});

						if (students.length === 0) return null;
						const gradeLevel = students[0].grade_level;
						let maleCount = 0;
						let femaleCount = 0;
						students.forEach((s) => {
							if (s.account?.sex === "Male") maleCount++;
							else if (s.account?.sex === "Female") femaleCount++;
						});

						const totalSubjects = subjectStatuses.length;
						const completedSubjects = subjectStatuses.filter((s) => s.is_completed).length;
						const incompleteSubjects = subjectStatuses.filter((s) => s.is_incomplete).length;
						const notEncoded =
							totalSubjects - (completedSubjects + incompleteSubjects);

						let status = "NO INPUT";
						if (completedSubjects === totalSubjects && totalSubjects > 0) status = "COMPLETE";
						else if (incompleteSubjects > 0) status = "INCOMPLETE";

						return {
							grade_level: gradeLevel,
							section: advJSON.section?.section_name || "Unknown Section",
							program: advJSON.program || "N/A",
							adviser: adviserName,
							male: maleCount,
							female: femaleCount,
							total: maleCount + femaleCount,
							completedSubjects,
							incompleteSubjects,
							totalSubjects,
							notEncoded,
							status,
						};
					})
				);

				const filteredSummary = summary.filter(Boolean);

				return res.json({
					success: true,
					message: "✅ Successfully fetched SHS SF9 summary per adviser/section.",
					data: filteredSummary,
				});
			} catch (err) {
				console.error("❌ Error fetching SHS SF9 summary:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});
	}

	postRouter() {
		this.router.post("/add", async (req, res) => {
			try {
				const {
					firstName,
					middleName,
					lastName,
					suffix,
					age,
					sex,
					email,
					program,
					currentSY
				} = req.body;

				if (!firstName || !middleName || !lastName || !sex) {
					return res.status(400).json({ success: false, message: "Missing required fields." });
				}

				if (email) {
					const existing = await AdviserAccount.findOne({ where: { email } });
					if (existing) {
						return res.status(400).json({ success: false, message: "Email already exists." });
					}
				}

				let newSY = currentSY;
				const schoolYears = await SchoolYear.findAll();
				if (schoolYears.length) {
					const lastYear = schoolYears[schoolYears.length - 1];
					if (lastYear.isPublished) {
						const [currentStart, currentEnd] = currentSY.split("-").map(Number);
						const nextSchoolYear = `${currentStart + 1}-${currentEnd + 1}`;
						newSY = nextSchoolYear;
					} else {
						newSY = lastYear.school_year;
					}
				}

				const password = await bcrypt.hash(`123`, 10);
				const account = await AdviserAccount.create({
					firstName,
					middleName,
					lastName,
					suffix,
					name: [firstName, middleName, lastName, suffix].filter(Boolean).join(" "),
					age: age || null,
					sex,
					email: email || null,
					password,
				});

				const defaultStatus = "NO INPUT";
				const shssf2 = await SHSSF2.create({
					january_status: defaultStatus,
					february_status: defaultStatus,
					march_status: defaultStatus,
					april_status: defaultStatus,
					may_status: defaultStatus,
					june_status: defaultStatus,
					july_status: defaultStatus,
					august_status: defaultStatus,
					september_status: defaultStatus,
					october_status: defaultStatus,
					november_status: defaultStatus,
					december_status: defaultStatus,
				});

				await Adviser.create({
					adviser_id: account.id,
					program: program || null,
					handle_section_id: null,
					handle_subject_ids: [],
					shs_sf9_id: null,
					shs_sf2_id: shssf2.id,
					subject_questions_ids: [],
					school_year: newSY,
				});
				res.json({ success: true, message: "Adviser and SHSSF2 record created successfully." });
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});


		this.router.post("/login", async (req, res) => {
			try {
				const { email, password } = req.body;

				if (!email || !password) {
					return res.status(400).json({ success: false, message: "Email and password are required." });
				}

				const adviser = await AdviserAccount.findOne({ where: { email } });
				if (!adviser) {
					return res.status(404).json({ success: false, message: "Adviser not found." });
				}

				const isMatch = await bcrypt.compare(password, adviser.password);
				if (!isMatch) {
					return res.status(401).json({ success: false, message: "Invalid credentials." });
				}

				const token = jwt.sign(
					{ id: adviser.id, role: "teacher" },
					process.env.JWT_SECRET || "secretkey",
					{ expiresIn: "1d" }
				);

				const userData = {
					id: adviser.id,
					name: adviser.name,
					email: adviser.email,
					sex: adviser.sex,
					role: "teacher",
				};

				res.json({
					success: true,
					message: "Login successful.",
					token,
					user: userData,
				});
			} catch (err) {
				console.error(err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		this.router.post("/update", async (req, res) => {
			try {
				const { adviser_id, grades, status, shssf2, school_year, attendance } = req.body;

				const adviser = await Adviser.findOne({ where: { adviser_id, school_year } });
				if (!adviser)
					return res.status(404).json({ success: false, message: "Adviser not found." });

				// ======= SHSSF2 Update =======
				let shsRecord;
				if (adviser.shs_sf2_id) {
					shsRecord = await SHSSF2.findByPk(adviser.shs_sf2_id);
					if (shsRecord) {
						await shsRecord.update(shssf2);
					} else {
						shsRecord = await SHSSF2.create(shssf2);
						await adviser.update({ shs_sf2_id: shsRecord.id });
					}
				} else {
					shsRecord = await SHSSF2.create(shssf2);
					await adviser.update({ shs_sf2_id: shsRecord.id });
				}

				// ======= Subject Status Update =======
				if (status && Object.keys(status).length > 0) {
					const shsSf9 = await SHSSF9.findByPk(adviser.shs_sf9_id);
					if (!shsSf9)
						return res
							.status(404)
							.json({ success: false, message: "SHSSF9 record not found for adviser." });

					let subjectStatusIds = shsSf9.subject_status_ids || [];

					for (const [subjectIdStr, state] of Object.entries(status)) {
						const subjectId = parseInt(subjectIdStr, 10);
						let subjectStatus = await SubjectStatus.findOne({
							where: { subject_id: subjectId, id: { [Op.in]: subjectStatusIds } },
						});

						if (!subjectStatus) {
							subjectStatus = await SubjectStatus.create({
								subject_id: subjectId,
								is_completed: false,
								is_incomplete: true,
							});
							subjectStatusIds.push(subjectStatus.id);
						}

						await subjectStatus.update({
							is_completed: state === "COMPLETE",
							is_incomplete: state !== "COMPLETE",
						});
					}

					const allSubjects = await SubjectStatus.findAll({
						where: { id: { [Op.in]: subjectStatusIds } },
					});
					const allComplete =
						allSubjects.length > 0 && allSubjects.every((s) => s.is_completed);
					const currentStatus = allComplete ? "COMPLETED" : "INCOMPLETE";

					await SHSSF9.update(
						{ subject_status_ids: subjectStatusIds, current_status: currentStatus },
						{ where: { id: adviser.shs_sf9_id } }
					);
				}

				// ======= Grades Update =======
				if (grades && Object.keys(grades).length > 0) {
					console.log("📘 Starting grade updates...");

					for (const [subjectIdStr, studentGrades] of Object.entries(grades)) {
						const subjectId = parseInt(subjectIdStr, 10);
						for (const [studentIdStr, gradeObj] of Object.entries(studentGrades)) {
							const studentId = parseInt(studentIdStr, 10);
							const student = await Student.findByPk(studentId);
							if (!student) continue;

							let subjectGradeIds = student.subject_grade_ids || [];
							let studentGrade = await StudentGrade.findOne({
								where: { subject_id: subjectId, id: { [Op.in]: subjectGradeIds } },
							});

							if (!studentGrade) {
								studentGrade = await StudentGrade.create({ subject_id: subjectId, ...gradeObj });
								subjectGradeIds.push(studentGrade.id);
								await student.update({ subject_grade_ids: subjectGradeIds });
							} else {
								await studentGrade.update(gradeObj);
							}
						}
					}
				}

				if (attendance && Object.keys(attendance).length > 0) {
					console.log("📘 Starting attendance updates...");

					for (const [studentIdStr, subjectData] of Object.entries(attendance)) {
						const studentId = parseInt(studentIdStr, 10);
						const student = await Student.findByPk(studentId);
						if (!student) {
							console.log(`⚠️ Student ${studentId} not found, skipping attendance...`);
							continue;
						}
						let attendanceRecord = null;
						if (student.attendance_id) {
							attendanceRecord = await Attendance.findByPk(student.attendance_id);
						}

						if (!attendanceRecord) {
							attendanceRecord = await Attendance.create({ subject_attendance_ids: [] });
							await student.update({ attendance_id: attendanceRecord.id });
						}

						let subjectAttendanceIds = attendanceRecord.subject_attendance_ids || [];
						for (const [subjectIdStr, monthData] of Object.entries(subjectData)) {
							const subjectId = parseInt(subjectIdStr, 10);
							let subjectAttendance = await SubjectAttendance.findOne({
								where: { subject_id: subjectId, id: { [Op.in]: subjectAttendanceIds } },
							});
							if (!subjectAttendance) {
								subjectAttendance = await SubjectAttendance.create({
									subject_id: subjectId,
									...monthData,
								});
								subjectAttendanceIds.push(subjectAttendance.id);
							} else {
								await subjectAttendance.update(monthData);
							}
						}
						await attendanceRecord.update({ subject_attendance_ids: subjectAttendanceIds });
					}
				}
				console.log("✅ Update process completed");
				res.json({
					success: true,
					message: "Adviser, SHSSF2, statuses, grades, and attendance updated successfully.",
				});
			} catch (err) {
				console.error("❌ Error during update:", err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});


		this.router.post("/update-adviser-password", async (req, res) => {
			try {
				const { adviserId, oldPassword, newPassword } = req.body;

				if (!adviserId || !oldPassword || !newPassword) {
					return res.status(400).json({
						success: false,
						message: "Missing required fields.",
					});
				}

				const adviser = await AdviserAccount.findByPk(adviserId);
				if (!adviser) {
					return res.status(404).json({
						success: false,
						message: "Adviser not found.",
					});
				}

				const isMatch = await bcrypt.compare(oldPassword, adviser.password);
				if (!isMatch) {
					return res.status(401).json({
						success: false,
						message: "Old password is incorrect.",
					});
				}

				const hashedPassword = await bcrypt.hash(newPassword, 10);
				await adviser.update({ password: hashedPassword });

				return res.json({
					success: true,
					message: "Password updated successfully.",
				});
			} catch (err) {
				console.error("❌ Error in /update-adviser-password:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});


		this.router.post("/update-adviser-account", async (req, res) => {
			try {
				const {
					adviserAccountId,
					firstName,
					middleName,
					lastName,
					suffix,
					email,
					age,
					sex,
				} = req.body;

				if (!adviserAccountId) {
					return res.status(400).json({
						success: false,
						message: "Missing adviserAccountId.",
					});
				}

				const adviserAccount = await AdviserAccount.findByPk(adviserAccountId);
				if (!adviserAccount) {
					return res.status(404).json({
						success: false,
						message: "Adviser account not found.",
					});
				}

				await adviserAccount.update({
					firstName,
					middleName,
					lastName,
					suffix,
					email,
					age,
					sex,
					name: `${firstName} ${middleName} ${lastName} ${suffix}`.trim(),
				});

				return res.json({
					success: true,
					message: "Adviser account updated successfully.",
				});
			} catch (err) {
				console.error("❌ Error in /update-adviser-account:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/update-adviser", async (req, res) => {
			try {
				const { adviserId, ...fields } = req.body;
				const adviser = await Adviser.findOne({ where: { adviser_id: adviserId } });
				if (!adviser) return res.status(404).json({ success: false, message: "Adviser not found." });

				await AdviserAccount.update(fields, { where: { id: adviserId } });
				return res.json({ success: true, message: "Adviser updated successfully." });
			} catch (err) {
				console.error("Error updating adviser:", err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});

		this.router.post("/update-adviser-password-admin", async (req, res) => {
			try {
				const { adviserId, newPassword } = req.body;
				if (!newPassword) return res.status(400).json({ success: false, message: "New password required." });

				await AdviserAccount.update({ password: newPassword }, { where: { id: adviserId } });
				res.json({ success: true, message: "Password updated successfully." });
			} catch (err) {
				console.error("Error updating adviser password:", err);
				res.status(500).json({ success: false, message: "Internal server error." });
			}
		});


	}
}

module.exports = new AdviserRouter().router;

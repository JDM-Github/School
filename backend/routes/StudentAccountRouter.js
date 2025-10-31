// Author: JDM
// Created on: 2025-10-22T15:52:24.681Z

const express = require("express");
const { Op } = require("sequelize");
const { StudentAccount, Student, Section, Subject, Adviser, AdviserAccount, Group, AppliedSubject, SpecializedSubject, CoreSubject, StudentGrade, SubjectAttendance, SchoolYear, SubjectStatus, SHSSF9, SHSSF2, Attendance } = require("../models/Models");

class StudentAccountRouter {
	constructor() {
		this.router = express.Router();
		this.getRouter();
		this.postRouter();
	}

	getRouter() {
		this.router.get("/get-all", async (req, res) => {
			try {
				const { gradeForSY, school_year = "2024-2025" } = req.query;
				const studentAccounts = await StudentAccount.findAll({
					include: [
						{
							model: Student,
							as: "records",
							attributes: ["section_id", "grade_level", "subjects_ids", "school_year", "isNew", "isStartedSY"],
							include: [
								{
									model: Section,
									as: "section",
									attributes: ["id", "section_name"],
								},
							],
						},
					],
				});

				const subjects = await Subject.findAll({
					attributes: ["id", "name", "specialized_category"],
				});
				const subjectsMap = subjects.reduce((acc, subj) => {
					acc[subj.id] = subj;
					return acc;
				}, {});

				const advisersRaw = await Adviser.findAll({
					include: [
						{
							model: AdviserAccount,
							as: "account",
							attributes: ["id", "firstName", "middleName", "lastName", "suffix", "sex", "email", "age"]
						}
					],
					attributes: ["id", "adviser_id", "handle_section_id", "school_year", "program"],
				});

				const adviserMap = {};
				for (const adv of advisersRaw) {
					if (!adv.handle_section_id || !adv.school_year) continue;
					const key = `${adv.handle_section_id}_${adv.school_year}`;
					adviserMap[key] = adv.account;
				}

				const sectionsMap = {};
				for (const sa of studentAccounts) {
					const record = sa.records?.find(r => r.grade_level === gradeForSY);
					if (!record || record.school_year !== school_year) continue;
					if (record.isNew && !record.isStartedSY) continue;

					const sectionId = record.section.id;
					const schoolYear = record.school_year;

					if (!sectionsMap[sectionId]) {
						const adviserKey = `${sectionId}_${schoolYear}`;
						const adviser = adviserMap[adviserKey] || null;

						sectionsMap[sectionId] = {
							id: sectionId,
							name: record.section.section_name,
							grade: record.grade_level,
							adviserId: adviser ? adviser.id : null,
							subjects: record.subjects_ids?.map((id) => subjectsMap[id]?.name).filter(Boolean) || [],
							studentIds: [],
						};
					}
					sectionsMap[sectionId].studentIds.push(sa.id);
				}

				const students = studentAccounts.reduce((acc, sa) => {
					if (gradeForSY === "Grade 12") {

						const otherRecord = sa.records?.find(r => r.grade_level === "Grade 11");
						const [currentStart, currentEnd] = school_year.split("-").map(Number);
						const prevSchoolYear = `${currentStart - 1}-${currentEnd - 1}`;

						if (otherRecord && otherRecord.school_year === prevSchoolYear && sa.isEnrollThisSY) {
							acc.push({
								id: sa.id,
								firstName: sa.firstName,
								middleName: sa.middleName,
								lastName: sa.lastName,
								suffix: sa.suffix,
								age: sa.age,
								sex: sa.sex,
								email: sa.email,
								gradeLevel: sa.gradeLevel,
								currentSection: "Unassigned",
								subjects: [],
								adviser: null,
							});
							return acc;
						}
					}

					const record = sa.records?.find(r => r.grade_level === gradeForSY);
					if (!record) {
						if (sa.graduated) return acc;
						if (sa.status === "dropout") return acc;
						if (!sa.isEnrollThisSY) return acc;

						if (sa.gradeLevel !== gradeForSY) return acc;
						if (sa.currentSY !== school_year) return acc;

						acc.push({
							id: sa.id,
							firstName: sa.firstName,
							middleName: sa.middleName,
							lastName: sa.lastName,
							suffix: sa.suffix,
							age: sa.age,
							sex: sa.sex,
							email: sa.email,
							gradeLevel: sa.gradeLevel,
							currentSection: "Unassigned",
							subjects: [],
							adviser: null,
						});
						return acc;
					}

					if (record.school_year !== school_year) return acc;

					if (record.isNew && !record.isStartedSY) {
						acc.push({
							id: sa.id,
							firstName: sa.firstName,
							middleName: sa.middleName,
							lastName: sa.lastName,
							suffix: sa.suffix,
							age: sa.age,
							sex: sa.sex,
							email: sa.email,
							gradeLevel: sa.gradeLevel,
							currentSection: "Unassigned",
							subjects: [],
							adviser: null,
						});
						return acc;
					}
					const section = record.section;
					const sectionId = record.section_id;
					const subjectObjects = record.subjects_ids?.map(id => subjectsMap[id]).filter(Boolean) || [];
					const adviserKey = `${sectionId}_${school_year}`;
					const adviser = adviserMap[adviserKey] || null;

					acc.push({
						id: sa.id,
						firstName: sa.firstName,
						middleName: sa.middleName,
						lastName: sa.lastName,
						suffix: sa.suffix,
						age: sa.age,
						sex: sa.sex,
						email: sa.email,
						gradeLevel: record.grade_level,
						currentSection: section ? section.section_name : "Unassigned",
						subjects: subjectObjects,
						adviser: adviser
							? {
								id: adviser.id,
								firstName: adviser.firstName,
								middleName: adviser.middleName,
								lastName: adviser.lastName,
								suffix: adviser.suffix,
								sex: adviser.sex,
								email: adviser.email,
								age: adviser.age,
							}
							: null,
					});

					return acc;
				}, []);

				const sections = Object.values(sectionsMap);
				const groups = await Group.findAll({
					include: [
						{ model: AppliedSubject, as: "appliedSubjects" },
						{ model: SpecializedSubject, as: "specializedSubjects" },
						{ model: CoreSubject, as: "coreSubjects" },
					],
				});

				const subjectsById = Object.fromEntries(subjects.map((s) => [s.id, s]));
				const formattedGroups = groups.map((group) => ({
					id: group.id,
					name: group.name,
					applied_subjects:
						group.appliedSubjects?.subjects_ids
							?.map((id) => subjectsById[id])
							.filter(Boolean)
							.map((s) => ({ id: s.id, name: s.name, specialized_category: s.specialized_category })) || [],
					specialized_subjects:
						group.specializedSubjects?.subjects_ids
							?.map((id) => subjectsById[id])
							.filter(Boolean)
							.map((s) => ({ id: s.id, name: s.name, specialized_category: s.specialized_category })) || [],
					core_subjects:
						group.coreSubjects?.subjects_ids
							?.map((id) => subjectsById[id])
							.filter(Boolean)
							.map((s) => ({ id: s.id, name: s.name, specialized_category: s.specialized_category })) || [],
				}));

				const schoolYears = await SchoolYear.findAll();
				let willCheck = false;

				if (schoolYears.length > 0) {
					if (!schoolYears[schoolYears.length - 1].isPublished) {
						if (gradeForSY === "Grade 11" && schoolYears[schoolYears.length - 1].isGrade12Created) {
							willCheck = true;
						} else if (gradeForSY === "Grade 12" && schoolYears[schoolYears.length - 1].isGrade11Created) {
							willCheck = true;
						}
					}
				}

				const advisersToRemove = new Set(
					advisersRaw
						.filter(
							(adv) =>
								adv.school_year === school_year &&
								adv.handle_section_id !== null &&
								willCheck
						)
						.map((adv) => adv.adviser_id)
				);

				const advisersFiltered = advisersRaw.filter(
					(adv) => !advisersToRemove.has(adv.adviser_id)
				);

				return res.json({
					success: true,
					message: "Successfully fetched all data",
					data: {
						students,
						sections,
						advisers: advisersFiltered.map((adv) => adv.account),
						subjects,
						groups: formattedGroups
					},
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
				});
			}
		});





	}

	postRouter() {
		this.router.post("/create", async (req, res) => {
			try {
				const student = await StudentAccount.create(req.body);
				return res.json({
					success: true,
					message: "Student account created successfully.",
					data: student,
				});
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/create-sy-level", async (req, res) => {
			try {
				const { currentSchoolyear, grade, sections } = req.body;

				if (!currentSchoolyear || !grade || !Array.isArray(sections)) {
					return res.status(400).json({
						success: false,
						message: "Invalid payload. Expect currentSchoolyear, grade and sections[].",
					});
				}

				await Promise.all(
					sections.map(async (sec, index) => {
						console.log(`\n[${index + 1}/${sections.length}] Processing section "${sec.name}"...`);

						const sectionName = String(sec.name).trim();
						if (!sectionName) {
							console.warn("⚠️ Section has empty name, skipping.");
							return;
						}

						// SECTION
						const [sectionInstance, createdSection] = await Section.findOrCreate({
							where: { section_name: sectionName },
							defaults: { section_name: sectionName },
						});
						console.log(createdSection ? "🆕 Created Section:" : "✅ Found Section:", sectionInstance.id);

						// SUBJECTS
						const subjectResults = await Promise.all(
							(sec.subjects || []).map(async (subjName) => {
								const name = String(subjName).trim();
								if (!name) return null;
								const [subjectInstance, createdSubject] = await Subject.findOrCreate({
									where: { name },
									defaults: { name },
								});
								console.log(createdSubject ? `🆕 Created Subject:` : `✅ Found Subject:`, name);
								return { name, id: subjectInstance.id };
							})
						);
						const validSubjects = subjectResults.filter(Boolean);
						const subjectIds = validSubjects.map((s) => s.id);
						console.log("Subjects count:", subjectIds.length);

						// ATTENDANCE + GRADES
						const subjectGrade = [];
						const subjectAttendances = [];
						for (const subject_id of subjectIds) {
							const sa = await SubjectAttendance.create({
								subject_id,
								january: [], february: [], march: [], april: [],
								may: [], june: [], july: [], august: [],
								september: [], october: [], november: [], december: [],
							});
							const sg = await StudentGrade.create({
								subject_id,
								first_quarter: "0", second_quarter: "0",
								third_quarter: "0", final_quarter: "0",
							});
							subjectAttendances.push(sa.id);
							subjectGrade.push(sg.id);
						}
						console.log("Created attendance + grade scaffolds for subjects.");

						const attendance = await Attendance.create({
							subject_attendance_ids: subjectAttendances,
						});
						console.log("🧾 Attendance ID:", attendance.id);

						// STUDENTS
						const allStudentIds = sec.studentIds || [];
						console.log("Student IDs in section:", allStudentIds.length);

						if (allStudentIds.length > 0) {
							const students = await StudentAccount.findAll({
								where: { id: { [Op.in]: allStudentIds } },
								attributes: ["id", "firstName", "lastName", "gradeLevel", "currentSY"],
							});
							console.log("Fetched student accounts:", students.length);

							for (const account of students) {
								if (account.currentSY !== currentSchoolyear) {
									const [start, end] = currentSchoolyear.split("-").map(Number);
									const startedSY = `${start - 1}-${end - 1}`;
									await Student.create({
										student_account_id: account.id,
										section_id: sectionInstance.id,
										attendance_id: attendance.id,
										grade_level: grade,
										subject_grade_ids: subjectGrade,
										subjects_ids: subjectIds,
										school_year: currentSchoolyear,
										isNew: false,
										isStartedSY: true,
										startedSY,
									});
								} else {
									console.log(`🔁 Updating existing student record for ${account.firstName} ${account.lastName}`);
									const studentInstance = await Student.findOne({
										where: {
											student_account_id: account.id,
											school_year: currentSchoolyear,
										},
									});

									if (studentInstance) {
										await Student.update(
											{
												attendance_id: attendance.id,
												subject_grade_ids: subjectGrade,
												section_id: sectionInstance.id,
												subjects_ids: subjectIds,
												isNew: false,
												isStartedSY: true,
											},
											{ where: { id: studentInstance.id } }
										);
									} else {
										console.warn("⚠️ No existing student found to update for:", account.id);
									}
								}
							}

							await StudentAccount.update(
								{
									currentSY: currentSchoolyear,
									isPassedThisSY: false,
									isEnrollThisSY: false,
									gradeLevel: grade,
								},
								{ where: { id: { [Op.in]: allStudentIds } } }
							);
							console.log("🧑‍🎓 Updated StudentAccount currentSY and grade info.");

							// ADVISER
							const adviserAccount = await AdviserAccount.findByPk(sec.adviserId);
							if (!adviserAccount) {
								console.warn("⚠️ Adviser not found with ID:", sec.adviserId);
								return;
							}
							console.log("👨‍🏫 Adviser found:", adviserAccount.id);

							const newAdviserInThisSY = await Adviser.findOne({
								where: { adviser_id: adviserAccount.id, school_year: currentSchoolyear },
							});

							const subjectStatusEntries = await Promise.all(
								subjectIds.map(subject_id =>
									SubjectStatus.create({
										subject_id,
										is_completed: false,
										is_incomplete: false,
									})
								)
							);
							const shssf9 = await SHSSF9.create({
								subject_status_ids: subjectStatusEntries.map(s => s.id),
								current_status: "NO INPUT",
							});
							console.log("📘 Created SHS SF9 for adviser:", shssf9.id);

							if (newAdviserInThisSY) {
								console.log("🔄 Updating adviser record for current SY.");
								await Adviser.update(
									{
										handle_section_id: sectionInstance.id,
										handle_subject_ids: subjectIds,
										shs_sf9_id: shssf9.id,
										subject_questions_ids: [],
									},
									{
										where: { adviser_id: adviserAccount.id, school_year: currentSchoolyear },
									}
								);
							} else {
								console.log("🆕 Creating new adviser record for this SY.");
								const oldAdviserRecord = await Adviser.findOne({
									where: { adviser_id: adviserAccount.id },
								});

								const shssf2 = await SHSSF2.create({
									january_status: "NO INPUT",
									february_status: "NO INPUT",
									march_status: "NO INPUT",
									april_status: "NO INPUT",
									may_status: "NO INPUT",
									june_status: "NO INPUT",
									july_status: "NO INPUT",
									august_status: "NO INPUT",
									september_status: "NO INPUT",
									october_status: "NO INPUT",
									november_status: "NO INPUT",
									december_status: "NO INPUT",
								});

								await Adviser.create({
									adviser_id: adviserAccount.id,
									program: oldAdviserRecord?.program || "UNKNOWN",
									handle_section_id: sectionInstance.id,
									handle_subject_ids: subjectIds,
									shs_sf9_id: shssf9.id,
									shs_sf2_id: shssf2.id,
									subject_questions_ids: [],
									school_year: currentSchoolyear,
								});
							}
						}
					})
				);

				const [schoolYear] = await SchoolYear.findOrCreate({
					where: { school_year: currentSchoolyear },
					defaults: { school_year: currentSchoolyear },
				});

				await SchoolYear.update(
					{
						isGrade11Created: (schoolYear.isGrade11Created || grade === "Grade 11"),
						isGrade12Created: (schoolYear.isGrade12Created || grade === "Grade 12")
					},
					{ where: { id: schoolYear.id } }
				);
				return res.json({
					success: true,
					message: "Sections resolved (created or found).",
				});
			} catch (err) {
				console.error("❌ Error in /create-sy-level:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});

		this.router.post("/publish-sy-level", async (req, res) => {
			try {
				const { currentSchoolyear } = req.body;

				if (!currentSchoolyear) {
					return res.status(400).json({
						success: false,
						message: "Invalid payload. Expect currentSchoolyear.",
					});
				}

				const [currentStart, currentEnd] = currentSchoolyear.split("-").map(Number);
				const previousSchoolYear = `${currentStart - 1}-${currentEnd - 1}`;

				const students = await Student.findAll({
					where: {
						school_year: previousSchoolYear,
						grade_level: "Grade 12",
					},
				});

				await Promise.all(
					students.map(async (student) => {
						await StudentAccount.update(
							{ graduated: true },
							{ where: { id: student.student_account_id } }
						);
					})
				);

				await SchoolYear.update(
					{ isPublished: true },
					{ where: { school_year: currentSchoolyear } }
				);

				const defaultVision =
					"To develop students into responsible, competent, and morally upright citizens equipped with 21st-century skills to thrive in an ever-changing global society.";
				const defaultMission =
					"Provide quality education that nurtures academic excellence and personal growth. Encourage critical thinking, creativity, and problem-solving skills among students. Foster values and discipline to produce responsible and ethical individuals. Promote inclusivity and collaboration within the school community. Utilize innovative teaching methods and technology to enhance learning outcomes.";

				const previousVM = await VisionMission.findOne({
					where: { school_year: previousSchoolYear },
				});

				const visionToUse = previousVM?.vision || defaultVision;
				const missionToUse = previousVM?.mission || defaultMission;

				let currentVM = await VisionMission.findOne({
					where: { school_year: currentSchoolyear },
				});

				if (!currentVM) {
					currentVM = await VisionMission.create({
						school_year: currentSchoolyear,
						vision: visionToUse,
						mission: missionToUse,
					});
				} else {
					await currentVM.update({
						vision: visionToUse,
						mission: missionToUse,
					});
				}

				return res.json({
					success: true,
					message: "School year published successfully.",
					data: {
						school_year: currentSchoolyear,
						vision: currentVM.vision,
						mission: currentVM.mission,
					},
				});
			} catch (err) {
				console.error("❌ Error in /publish-sy-level:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error.",
				});
			}
		});


	}
}

module.exports = new StudentAccountRouter().router;

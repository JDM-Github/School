// Author: JDM
// Created on: 2025-10-22T15:52:24.681Z

const express = require("express");
const { StudentAccount, Student, Section, Subject, Adviser, AdviserAccount, Group, AppliedSubject, SpecializedSubject, CoreSubject } = require("../models/Models");

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
					attributes: ["id", "adviser_id", "handle_section_id", "school_year"],
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

				return res.json({
					success: true,
					message: "Successfully fetched all data",
					data: {
						students,
						sections,
						advisers: advisersRaw.map((adv) => adv.account),
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
	}
}

module.exports = new StudentAccountRouter().router;

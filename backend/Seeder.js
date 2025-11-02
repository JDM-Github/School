// Author: JDM
// Created on: 2025-10-21
"use strict";

const sequelize = require("./models/Sequelize.js");
const bcrypt = require('bcryptjs');
const { faker } = require("@faker-js/faker");
const { getDaysInMonth } = require("date-fns");
const Subject = require("./models/SubjectModel.js");
const Section = require("./models/SectionModel.js");
const Attendance = require("./models/AttendanceModel.js");
const SubjectAttendance = require("./models/SubjectAttendanceModel.js");
const Student = require("./models/StudentModel.js");
const StudentAccount = require("./models/StudentAccountModel.js");
const Adviser = require('./models/AdviserModel.js');
const AdviserAccount = require('./models/AdviserAccountModel.js');
const SHSSF9 = require('./models/SHSSF9Model.js');
const SHSSF2 = require('./models/SHSSF2Model.js');
const SubjectStatus = require('./models/SubjectStatusModel.js');
const StudentGrade = require("./models/StudentGradeModel.js");
const Group = require("./models/GroupModel.js");
const SchoolYear = require("./models/SchoolYearModel.js");
const SpecializedSubject = require("./models/SpecializedSubjectsModel.js");
const CoreSubject = require("./models/CoreSubjectsModel.js");
const AppliedSubject = require("./models/AppliedSubjectsModel.js");

function getRandomAttendanceDays(year, month, minDays = 1, maxDays = 5) {
    const totalDays = getDaysInMonth(new Date(year, month, 1));
    const numDays = faker.number.int({ min: minDays, max: Math.min(maxDays, totalDays) });
    const days = new Set();
    while (days.size < numDays) {
        days.add(faker.number.int({ min: 1, max: totalDays }));
    }
    return Array.from(days).map(String);
}

async function destroyAll() {
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    const models = [
        StudentGrade,
        SubjectStatus,
        SHSSF2,
        SHSSF9,
        AdviserAccount,
        Adviser,
        StudentAccount,
        Student,
        SubjectAttendance,
        Attendance,
        Section,
        Subject,
        Group,
        SchoolYear,
        AppliedSubject,
        CoreSubject,
        SpecializedSubject
    ];

    await queryInterface.bulkDelete("Subjects", null, {});
    await queryInterface.bulkDelete("StudentGrades", null, {});
    await queryInterface.bulkDelete("Groups", null, {});
    await queryInterface.bulkDelete("Students", null, {});
    await queryInterface.bulkDelete("SchoolYears", null, {});
    await queryInterface.bulkDelete("AppliedSubjects", null, {});
    await queryInterface.bulkDelete("CoreSubjects", null, {});
    await queryInterface.bulkDelete("SpecializedSubjects", null, {});

    // Destroy all models with truncation and identity reset
    for (const model of models) {
        await model.destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true,
        });
        console.log(`Destroyed: ${model.name}`);
    }

    console.log("✅ All tables cleared.");
}


class Seeder {
    static randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static async initDB(force = false) {
        console.log(`🔄 Syncing database... (force: ${force})`);
        await sequelize.sync({ force: true });
        // await destroyAll();
        console.log("✅ Database ready!\n");
    }

    static async seedBaseData() {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();

        console.log("🌱 Starting base data seed...");

        const subjects = [
            // 🌱 STEM
            "Practical Research 1",
            "Empowerment Technologies",
            "Pre-Calculus",
            "General Physics 1",
            "Oral Communication",
            "21st Century Literature",
            // 🌱 ABM
            "Business Ethics",
            "Applied Economics",
            "Principles of Marketing",
            "Business Finance",
            "Understanding Culture, Society, and Politics",
            "Media and Information Literacy",
            // 🌱 TVL
            "Entrepreneurship",
            "Cookery 1",
            "Cookery 2",
            "Bread and Pastry Production 1",
            "Bread and Pastry Production 2",
            "Physical Education and Health",
            "Personal Development",
        ];

        const subjectRecords = subjects.map((name, i) => ({
            name,
            specialized_category: name.includes("Cookery")
                ? "Cookery"
                : name.includes("Bread and Pastry")
                    ? "Bread & Pastry"
                    : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert("Subjects", subjectRecords);
        await queryInterface.bulkInsert("SchoolYears", [
            { school_year: "2024-2025", isGrade11Created: true, isGrade12Created: false, isPublished: true, createdAt: new Date(), updatedAt: new Date() },
            { school_year: "2025-2026", isGrade11Created: true, isGrade12Created: true, isPublished: true, createdAt: new Date(), updatedAt: new Date() },
        ])
        await queryInterface.bulkInsert("AppliedSubjects", [
            { subjects_ids: [1, 2], createdAt: new Date(), updatedAt: new Date() },
            { subjects_ids: [7, 8], createdAt: new Date(), updatedAt: new Date() },
            { subjects_ids: [13, 2], createdAt: new Date(), updatedAt: new Date() },
        ]);
        await queryInterface.bulkInsert("CoreSubjects", [
            { subjects_ids: [5, 6], createdAt: new Date(), updatedAt: new Date() },
            { subjects_ids: [11, 12], createdAt: new Date(), updatedAt: new Date() },
            { subjects_ids: [18, 19], createdAt: new Date(), updatedAt: new Date() },
        ]);
        await queryInterface.bulkInsert("SpecializedSubjects", [
            { subjects_ids: [3, 4], createdAt: new Date(), updatedAt: new Date() },
            { subjects_ids: [9, 10], createdAt: new Date(), updatedAt: new Date() },
            { subjects_ids: [14, 15, 16, 17], createdAt: new Date(), updatedAt: new Date() },
        ]);
        await queryInterface.bulkInsert("Groups", [
            {
                name: "STEM",
                applied_subjects_id: 1,
                specialized_subjects_id: 1,
                core_subjects_id: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "ABM",
                applied_subjects_id: 2,
                specialized_subjects_id: 2,
                core_subjects_id: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "TVL",
                applied_subjects_id: 3,
                specialized_subjects_id: 3,
                core_subjects_id: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    }

    static async setAdviserAccounts(count = 10) {
        console.log(`👤 Seeding ${count} adviser accounts...`);
        const password = await bcrypt.hash("123", 10);

        await Promise.all(
            Array.from({ length: count }).map(async () => {
                const firstName = faker.person.firstName();
                const middleName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const suffix = faker.person.suffix();

                const nameParts = [firstName, middleName, lastName, suffix].filter(Boolean);
                const name = nameParts.join(" ");

                const age = faker.number.int({ min: 16, max: 19 });
                const sex = faker.person.sexType() === "male" ? "Male" : "Female";
                const email = faker.internet.email({ firstName, lastName }).toLowerCase();

                await AdviserAccount.create({
                    name,
                    firstName,
                    middleName,
                    lastName,
                    suffix,
                    age,
                    sex,
                    email,
                    password,
                });
            })
        );
        console.log(`✅ Successfully created ${count} adviser accounts.`);
    }

    static async seedStudentAccounts(count = 50) {
        console.log(`👤 Seeding ${count} student accounts...`);
        const password = await bcrypt.hash("123", 10);
        await Promise.all(
            Array.from({ length: count }).map(async () => {
                const firstName = faker.person.firstName();
                const middleName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const suffix = faker.person.suffix();

                const nameParts = [firstName, middleName, lastName, suffix].filter(Boolean);
                const name = nameParts.join(" ");

                const age = faker.number.int({ min: 16, max: 19 });
                const sex = faker.person.sexType() === "male" ? "Male" : "Female";
                const email = faker.internet.email({ firstName, lastName }).toLowerCase();

                const gradeLevel = faker.datatype.boolean() ? "Grade 11" : "Grade 12";

                await StudentAccount.create({
                    name,
                    firstName,
                    middleName,
                    lastName,
                    suffix,
                    age,
                    sex,
                    email,
                    password,

                    // WHEN UPDATE AND PASSED ON GRADE 12 THIS WILL UPDATE TO GRADUATE
                    graduated: false,
                    status: "active",
                    isRepeater: false,
                    retained: true,

                    // WHEN THEY PASSED, THIS WILL UPDATE TO NEW GRADE LEVEL
                    gradeLevel,
                    currentSY: "2025-2026", // SET THE CURRENT SY TO NEXT
                    isEnrollThisSY: false, // WHEN UPDATE TO PASSED, THIS WILL BE TURN TO OFF AGAIN
                    isPassedThisSY: false, // WHEN YOU PASSED THIS WILL TURN TO TRUE, SO THEY CAN ENROLL, WHEN THEY ENROLL IT WILL FALSE AGAIN
                    isNew: false
                });
            })
        );

        await Promise.all(
            Array.from({ length: Math.floor(count * 0.2) }).map(async () => {
                const firstName = faker.person.firstName();
                const middleName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const suffix = faker.person.suffix();

                const nameParts = [firstName, middleName, lastName, suffix].filter(Boolean);
                const name = nameParts.join(" ");

                const age = faker.number.int({ min: 17, max: 20 });
                const sex = faker.person.sexType() === "male" ? "Male" : "Female";
                const email = faker.internet.email({ firstName, lastName }).toLowerCase();

                const gradeLevel = faker.datatype.boolean() ? "Grade 11" : "Grade 12";
                await StudentAccount.create({
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
                    gradeLevel: gradeLevel,
                    currentSY: "2026-2027",
                    isEnrollThisSY: true,
                    isPassedThisSY: false,
                    isNew: true,
                });
            })
        );
    }

    static async seedStudents() {
        console.log(`🎓 Seeding student records...`);

        const sectionSet = new Set();
        while (sectionSet.size < 10) {
            const letter = faker.string.alpha({ casing: "upper", length: 1 });
            const number = faker.number.int({ min: 1, max: 9 });
            sectionSet.add(`${letter}${number}`);
        }
        const sectionNames = Array.from(sectionSet);

        const sections = await Promise.all(
            sectionNames.map(name => Section.create({ section_name: name }))
        );

        const subjects = await Subject.findAll();
        const studentAccounts = await StudentAccount.findAll();

        const sectionSubjectsMap = new Map();
        for (const section of sections) {
            const selectedSubjects = faker.helpers.arrayElements(
                subjects,
                faker.number.int({ min: 4, max: 8 })
            );
            sectionSubjectsMap.set(`${section.id}`, selectedSubjects);
        }

        const usedSections = {};
        const sortedStudents = studentAccounts.sort((a, b) => {
            if (a.gradeLevel === "Grade 12" && b.gradeLevel !== "Grade 12") return -1;
            if (a.gradeLevel !== "Grade 12" && b.gradeLevel === "Grade 12") return 1;
            return 0;
        });

        for (const account of sortedStudents) {
            if (account.isNew) {
                const gradeLevel = account.gradeLevel || "Grade 11";
                await Student.create({
                    student_account_id: account.id,
                    section_id: null,
                    attendance_id: null,
                    grade_level: gradeLevel,
                    subject_grade_ids: [],
                    subjects_ids: [],
                    school_year: account.currentSY || "2026-2027",
                    isNew: true,
                    isStartedSY: false,
                    startedSY: "2025-2026"
                });
                continue;
            }

            const gradeLevels = ["Grade 11", "Grade 12"];
            const schoolYears =
                account.gradeLevel === "Grade 11"
                    ? ["2025-2026"]
                    : ["2024-2025", "2025-2026"];

            for (const [index, schoolYear] of schoolYears.entries()) {
                const gradeLvl = gradeLevels[index];
                const isNew = gradeLvl === "Grade 11";
                if (!usedSections[gradeLvl]) usedSections[gradeLvl] = [];

                const yearStart = parseInt(schoolYear.split("-")[0]);
                const allUsedSectionIds = Object.values(usedSections).flat();
                const availableSections = sections.filter(
                    s => !allUsedSectionIds.includes(s.id)
                );

                let section;
                if (availableSections.length > 0) {
                    section = faker.helpers.arrayElement(availableSections);
                } else {
                    const fallbackSections = sections.filter(s =>
                        usedSections[gradeLvl].includes(s.id)
                    );
                    section = faker.helpers.arrayElement(fallbackSections);
                }

                usedSections[gradeLvl].push(section.id);
                const subjectsForSection = sectionSubjectsMap.get(`${section.id}`) || [];

                const monthYearMap = {
                    january: yearStart + 1,
                    february: yearStart + 1,
                    march: yearStart + 1,
                    april: yearStart + 1,
                    may: yearStart + 1,
                    june: yearStart,
                    july: yearStart,
                    august: yearStart,
                    september: yearStart,
                    october: yearStart,
                    november: yearStart,
                    december: yearStart,
                };

                const subjectGrade = [];
                const subjectAttendances = [];

                for (const subject of subjectsForSection) {
                    const sa = await SubjectAttendance.create({
                        subject_id: subject.id,
                        january: getRandomAttendanceDays(monthYearMap.january, 0),
                        february: getRandomAttendanceDays(monthYearMap.february, 1),
                        march: getRandomAttendanceDays(monthYearMap.march, 2),
                        april: getRandomAttendanceDays(monthYearMap.april, 3),
                        may: getRandomAttendanceDays(monthYearMap.may, 4),
                        june: getRandomAttendanceDays(monthYearMap.june, 5),
                        july: getRandomAttendanceDays(monthYearMap.july, 6),
                        august: getRandomAttendanceDays(monthYearMap.august, 7),
                        september: getRandomAttendanceDays(monthYearMap.september, 8),
                        october: getRandomAttendanceDays(monthYearMap.october, 9),
                        november: getRandomAttendanceDays(monthYearMap.november, 10),
                        december: getRandomAttendanceDays(monthYearMap.december, 11),
                    });

                    const randomGrade = () => {
                        const roll = Math.random();
                        if (roll < 0.1) return Math.floor(Math.random() * 10) + 60;
                        return Math.floor(Math.random() * 25) + 75;
                    };

                    const sg = await StudentGrade.create({
                        subject_id: subject.id,
                        first_quarter: String(randomGrade()),
                        second_quarter: String(randomGrade()),
                        third_quarter: String(randomGrade()),
                        final_quarter: String(randomGrade()),
                    });

                    subjectGrade.push(sg.id);
                    subjectAttendances.push(sa.id);
                }

                const attendance = await Attendance.create({
                    subject_attendance_ids: subjectAttendances,
                });

                await Student.create({
                    student_account_id: account.id,
                    section_id: section.id,
                    attendance_id: attendance.id,
                    grade_level: gradeLvl,
                    subject_grade_ids: subjectGrade,
                    subjects_ids: subjectsForSection.map(s => s.id),
                    school_year: schoolYear,
                    isNew,
                    isStartedSY: true,
                    startedSY: isNew ? "2023-2024" : "2024-2025"
                });
            }
        }

        console.log(
            `✅ Successfully seeded students — each section unique per school year, with isNew students minimally seeded.`
        );
    }

    static async seedAdvisers() {
        try {
            console.log("🎓 Seeding advisers...");
            const sections = await Section.findAll();
            const adviserAccounts = await AdviserAccount.findAll();
            const subjects = await Subject.findAll();

            if (!subjects.length || !sections.length || !adviserAccounts.length) {
                console.error("❌ Not enough data in Subjects, Sections, or AdviserAccounts to seed advisers.");
                return;
            }

            for (const schoolYear of ["2024-2025", "2025-2026"]) {
                const sectionSubjectsMap = new Map();

                for (const section of sections) {
                    const studentInSection = await Student.findOne({
                        where: { section_id: section.id, school_year: schoolYear },
                    });

                    if (studentInSection) {
                        const subjectIds = studentInSection.subjects_ids;
                        const sectionSubjects = await Subject.findAll({
                            where: { id: subjectIds },
                        });
                        sectionSubjectsMap.set(section.id, sectionSubjects);
                    } else {
                        const randomSubjects = faker.helpers.arrayElements(subjects, faker.number.int({ min: 4, max: 8 }));
                        sectionSubjectsMap.set(section.id, randomSubjects);
                    }
                }

                const shssf9Entries = await Promise.all(
                    sections.map(async section => {
                        const sectionSubjects = sectionSubjectsMap.get(section.id) || [];
                        const subjectStatusEntries = await Promise.all(
                            sectionSubjects.map(subj =>
                                SubjectStatus.create({
                                    subject_id: subj.id,
                                    is_completed: false,
                                    is_incomplete: false,
                                })
                            )
                        );
                        return SHSSF9.create({
                            subject_status_ids: subjectStatusEntries.map(s => s.id),
                            current_status: "NO INPUT",
                        });
                    })
                );

                const shssf2Entries = await Promise.all(
                    sections.map(() =>
                        SHSSF2.create({
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
                        })
                    )
                );

                const programs = ["ABM", "STEM", "HUMSS", "GAS", "TVL", "ICT"];

                await Promise.all(
                    sections.map((section, idx) => {
                        const adviser = adviserAccounts[idx % adviserAccounts.length];
                        const sectionSubjects = sectionSubjectsMap.get(section.id) || [];

                        return Adviser.create({
                            adviser_id: adviser.id,
                            program: Seeder.randomChoice(programs),
                            handle_section_id: section.id,
                            handle_subject_ids: sectionSubjects.map(s => s.id),
                            shs_sf9_id: shssf9Entries[idx].id,
                            shs_sf2_id: shssf2Entries[idx].id,
                            subject_questions_ids: [],
                            school_year: schoolYear,
                        });
                    })
                );
            }
            console.log("✅ Advisers seeding completed successfully — subjects now match their section's students!");
        } catch (err) {
            console.error("❌ Error seeding advisers:", err);
        } finally {
            await sequelize.close();
        }
    }

    static async clearAll() {
        console.log("🧹 Clearing all tables...");
        await sequelize.truncate({ cascade: true });
        console.log("✅ Database cleared!\n");
    }
}

if (require.main === module) {
    (async () => {
        await Seeder.initDB(true);
        await Seeder.seedBaseData();
        await Seeder.seedStudentAccounts(20);
        await Seeder.seedStudents();

        await Seeder.setAdviserAccounts();
        await Seeder.seedAdvisers();
        process.exit(0);
    })();
}
module.exports = Seeder;

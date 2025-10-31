// Author: JDM
// Created on: 2025-10-14T11:24:37.364Z

const sequelize = require("./Sequelize.js");
const Student = require("./StudentModel.js");
const Section = require("./SectionModel.js");
const Attendance = require("./AttendanceModel.js");
const Subject = require("./SubjectModel.js");
const SubjectAttendance = require("./SubjectAttendanceModel.js");
const AppliedSubject = require("./AppliedSubjectsModel.js");
const SpecializedSubject = require("./SpecializedSubjectsModel.js");
const CoreSubject = require("./CoreSubjectsModel.js");
const Group = require("./GroupModel.js");
const SubjectStatus = require("./SubjectStatusModel.js");
const SHSSF9 = require("./SHSSF9Model.js");
const SHSSF2 = require("./SHSSF2Model.js");
const Adviser = require("./AdviserModel.js");
const AdviserAccount = require("./AdviserAccountModel.js");
const Question = require("./QuestionModel.js");
const SubjectQuestions = require("./SubjectQuestionsModel.js");
const StudentResults = require("./StudentResultsModel.js");
const StudentAccount = require("./StudentAccountModel.js")
const StudentGrade = require("./StudentGradeModel.js")


Section.hasMany(Student, { foreignKey: "section_id", as: "students" });
Student.belongsTo(Section, { foreignKey: "section_id", as: "section" });


Attendance.hasMany(Student, { foreignKey: "attendance_id", as: "students" });
Student.belongsTo(Attendance, { foreignKey: "attendance_id", as: "attendance" });
Attendance.belongsToMany(SubjectAttendance, {
	through: "Attendance_SubjectAttendance",
	as: "subjectAttendances",
	foreignKey: "attendance_id",
	otherKey: "subject_attendance_id",
});
SubjectAttendance.belongsToMany(Attendance, {
	through: "Attendance_SubjectAttendance",
	as: "attendances",
	foreignKey: "subject_attendance_id",
	otherKey: "attendance_id",
});
Subject.hasMany(SubjectAttendance, { foreignKey: "subject_id", as: "attendances" });
SubjectAttendance.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Subject.hasMany(StudentGrade, { foreignKey: "subject_id", as: "grades" });
StudentGrade.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });

Student.belongsToMany(Subject, {
	through: "Student_Subjects",
	as: "subjects",
	foreignKey: "student_id",
	otherKey: "subject_id",
});
Subject.belongsToMany(Student, {
	through: "Student_Subjects",
	as: "students",
	foreignKey: "subject_id",
	otherKey: "student_id",
});



Group.belongsTo(AppliedSubject, {
	foreignKey: "applied_subjects_id",
	as: "appliedSubjects",
});
Group.belongsTo(SpecializedSubject, {
	foreignKey: "specialized_subjects_id",
	as: "specializedSubjects",
});
Group.belongsTo(CoreSubject, {
	foreignKey: "core_subjects_id",
	as: "coreSubjects",
});

AppliedSubject.belongsToMany(Subject, {
	through: "AppliedSubject_Subjects",
	as: "subjects",
	foreignKey: "applied_subject_id",
	otherKey: "subject_id",
});

SpecializedSubject.belongsToMany(Subject, {
	through: "SpecializedSubjects_Subjects",
	as: "subjects",
	foreignKey: "specialized_subject_id",
	otherKey: "subject_id",
});

CoreSubject.belongsToMany(Subject, {
	through: "CoreSubject_Subjects",
	as: "subjects",
	foreignKey: "core_subject_id",
	otherKey: "subject_id",
});

StudentAccount.hasMany(Student, {
	foreignKey: "student_account_id",
	as: "records",
});

Student.belongsTo(StudentAccount, {
	foreignKey: "student_account_id",
	as: "account",
});


// ADVISER
SubjectStatus.belongsTo(Subject, { foreignKey: "subject_id", as: "subject" });
Subject.hasMany(SubjectStatus, { foreignKey: "subject_id", as: "subjectStatuses" });

Adviser.belongsTo(AdviserAccount, {
	foreignKey: "adviser_id",
	as: "account",
	onUpdate: "CASCADE",
	onDelete: "SET NULL",
});
AdviserAccount.hasMany(Adviser, {
	foreignKey: "adviser_id",
	as: "advisers",
});

Adviser.belongsTo(Section, {
	foreignKey: "handle_section_id",
	as: "section",
	onUpdate: "CASCADE",
	onDelete: "CASCADE",
});
Section.hasOne(Adviser, {
	foreignKey: "handle_section_id",
	as: "adviser",
});

Adviser.belongsTo(SHSSF9, {
	foreignKey: "shs_sf9_id",
	as: "shsSf9",
	onUpdate: "CASCADE",
	onDelete: "SET NULL",
});
SHSSF9.hasOne(Adviser, {
	foreignKey: "shs_sf9_id",
	as: "adviser",
});

Adviser.belongsTo(SHSSF2, {
	foreignKey: "shs_sf2_id",
	as: "shsSf2",
	onUpdate: "CASCADE",
	onDelete: "SET NULL",
});
SHSSF2.hasOne(Adviser, {
	foreignKey: "shs_sf2_id",
	as: "adviser",
});





module.exports = {
	sequelize,
	Student,
	Section,
	Attendance,
	Subject,
	SubjectAttendance,
	AppliedSubject,
	SpecializedSubject,
	CoreSubject,
	Group,
	SubjectStatus,
	SHSSF9,
	SHSSF2,
	Adviser,
	Question,
	SubjectQuestions,
	StudentResults,
	StudentAccount,
	AdviserAccount: require("./AdviserAccountModel.js"),
	SchoolYear: require("./SchoolYearModel.js"),
	StudentGrade,
	VisionMission: require("./VisionMissionModel.js"),
};
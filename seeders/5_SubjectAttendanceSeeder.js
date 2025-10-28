// Author: JDM
// Created on: 2025-10-21T03:31:44.688Z

"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const now = new Date();

		// Example: first few subject IDs (adjust based on actual IDs in your DB)
		// You can later query dynamically if needed, but this assumes IDs start from 1.
		return queryInterface.bulkInsert(
			"SubjectAttendances",
			[
				{
					subject_id: 1, // Practical Research 1
					january: ["3", "5", "10", "15"],
					february: ["2", "6", "9", "20"],
					march: ["1", "5", "12"],
					april: [],
					may: [],
					june: [],
					july: [],
					august: [],
					september: [],
					october: [],
					november: [],
					december: [],
					createdAt: now,
					updatedAt: now,
				},
				{
					subject_id: 2, // Empowerment Technologies
					january: ["4", "6", "11"],
					february: ["1", "7", "14"],
					march: ["3", "10"],
					april: ["2"],
					may: [],
					june: [],
					july: [],
					august: [],
					september: [],
					october: [],
					november: [],
					december: [],
					createdAt: now,
					updatedAt: now,
				},
				{
					subject_id: 3, // Pre-Calculus
					january: ["2", "4", "8", "16", "23"],
					february: ["5", "8", "12", "22"],
					march: ["4", "8", "15"],
					april: [],
					may: [],
					june: [],
					july: [],
					august: [],
					september: [],
					october: [],
					november: [],
					december: [],
					createdAt: now,
					updatedAt: now,
				},
				{
					subject_id: 7, // Business Ethics
					january: ["5", "12", "19"],
					february: ["3", "10", "17"],
					march: ["7", "14"],
					april: [],
					may: [],
					june: [],
					july: [],
					august: [],
					september: [],
					october: [],
					november: [],
					december: [],
					createdAt: now,
					updatedAt: now,
				},
				{
					subject_id: 14, // Cookery 1
					january: ["2", "9", "16", "23"],
					february: ["6", "13", "20"],
					march: ["3", "10", "17"],
					april: [],
					may: [],
					june: [],
					july: [],
					august: [],
					september: [],
					october: [],
					november: [],
					december: [],
					createdAt: now,
					updatedAt: now,
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("SubjectAttendances", null, {});
	},
};

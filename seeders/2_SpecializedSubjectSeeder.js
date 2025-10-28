"use strict";

// Author: JDM
// Created on: 2025-10-21T07:31:12.336Z

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"SpecializedSubjects",
			[
				// 🌱 STEM - Group 1
				{
					subjects_ids: [3, 4],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 🌱 ABM - Group 1
				{
					subjects_ids: [9, 10],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 🌱 TVL - Group 1
				{
					subjects_ids: [14, 15, 16, 17],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("SpecializedSubjects", null, {});
	},
};

"use strict";

// Author: JDM
// Created on: 2025-10-21T07:30:55.872Z

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"AppliedSubjects",
			[
				// 🌱 STEM - Group 1
				{
					subjects_ids: [1, 2],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 🌱 ABM - Group 1
				{
					subjects_ids: [7, 8],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 🌱 TVL - Group 1
				{
					subjects_ids: [13, 2],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("AppliedSubjects", null, {});
	},
};

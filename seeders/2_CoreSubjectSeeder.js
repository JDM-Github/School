"use strict";

// Author: JDM
// Created on: 2025-10-21T07:31:03.885Z

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"CoreSubjects",
			[
				// 🌱 STEM - Group 1
				{
					subjects_ids: [5, 6],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 🌱 ABM - Group 1
				{
					subjects_ids: [11, 12],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				// 🌱 TVL - Group 1
				{
					subjects_ids: [18, 19],
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("CoreSubjects", null, {});
	},
};

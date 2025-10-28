// Author: JDM
// Created on: 2025-10-21T08:48:03.276Z

"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const now = new Date();
		return queryInterface.bulkInsert(
			"Sections",
			[
				{
					section_name: "A1",
					createdAt: now,
					updatedAt: now,
				},
				{
					section_name: "A2",
					createdAt: now,
					updatedAt: now,
				},
				{
					section_name: "B1",
					createdAt: now,
					updatedAt: now,
				},
				{
					section_name: "B2",
					createdAt: now,
					updatedAt: now,
				},
				{
					section_name: "C1",
					createdAt: now,
					updatedAt: now,
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Sections", null, {});
	},
};

"use strict";

// Author: JDM
// Created on: 2025-10-21T07:48:53.457Z

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Groups",
			[
				{
					name: "STEM - Group 1",
					applied_subjects_id: 1,
					specialized_subjects_id: 1,
					core_subjects_id: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "ABM - Group 1",
					applied_subjects_id: 2,
					specialized_subjects_id: 2,
					core_subjects_id: 2,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: "TVL - Group 1",
					applied_subjects_id: 3,
					specialized_subjects_id: 3,
					core_subjects_id: 3,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Groups", null, {});
	},
};

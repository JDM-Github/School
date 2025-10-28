"use strict";

// Author: JDM
// Created on: 2025-10-21T07:27:17.501Z

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			"Subjects",
			[
				// 🌱 STEM Group
				{ name: "Practical Research 1", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Empowerment Technologies", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Pre-Calculus", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "General Physics 1", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Oral Communication", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "21st Century Literature", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },

				// 🌱 ABM Group
				{ name: "Business Ethics", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Applied Economics", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Principles of Marketing", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Business Finance", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Understanding Culture, Society, and Politics", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Media and Information Literacy", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },

				// 🌱 TVL Group
				{ name: "Entrepreneurship", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Cookery 1", specialized_category: "Cookery", createdAt: new Date(), updatedAt: new Date() },
				{ name: "Cookery 2", specialized_category: "Cookery", createdAt: new Date(), updatedAt: new Date() },
				{ name: "Bread and Pastry Production 1", specialized_category: "Bread & Pastry", createdAt: new Date(), updatedAt: new Date() },
				{ name: "Bread and Pastry Production 2", specialized_category: "Bread & Pastry", createdAt: new Date(), updatedAt: new Date() },
				{ name: "Physical Education and Health", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
				{ name: "Personal Development", specialized_category: null, createdAt: new Date(), updatedAt: new Date() },
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete("Subjects", null, {});
	},
};

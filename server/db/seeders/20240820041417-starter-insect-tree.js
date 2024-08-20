'use strict';
const { where, Op } = require('sequelize');
const { Insect, Tree } = require('../models');
const insectTree = [
  {
    insect: { name: "Western Pygmy Blue Butterfly" },
    trees: [
      { tree: "General Sherman" },
      { tree: "General Grant" },
      { tree: "Lincoln" },
      { tree: "Stagg" },
    ],
  },
  {
    insect: { name: "Patu Digua Spider" },
    trees: [
      { tree: "Stagg" },
    ],
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    for (let insectIdx = 0; insectIdx < insectTree.length; insectIdx++){
      const { insect, trees } = insectTree[insectIdx];
      const insectInfo = await Insect.findOne({ where: { ...insect} });
      const treesInfo = await Tree.findAll({ where: {  [Op.or]: trees  } });
      await insectInfo.addTrees([...treesInfo]);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    for (let insectIdx = 0; insectIdx < insectTree.length; insectIdx++){
      const { insect, trees } = insectTree[insectIdx];
      const insectInfo = await Insect.findOne({ where: { ...insect} });
      const treesInfo = await Tree.findAll({ where:  { [Op.or]: trees  } });
      await insectInfo.removeTrees([...treesInfo]);
    }
  }
};

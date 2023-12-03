module.exports = (sequelize, Sequelize) => {
  const CsuqAnswers = sequelize.define("csuqanswers", {
    answer1: {
      type: Sequelize.INTEGER
    },
    answer2: {
      type: Sequelize.INTEGER
    },
    answer3: {
      type: Sequelize.INTEGER
    },
    answer4: {
      type: Sequelize.INTEGER
    },
    answer5: {
      type: Sequelize.INTEGER
    },
    answer6: {
      type: Sequelize.INTEGER
    },
    answer7: {
      type: Sequelize.INTEGER
    },
    answer8: {
      type: Sequelize.INTEGER
    },
    answer9: {
      type: Sequelize.INTEGER
    },
    answer10: {
      type: Sequelize.INTEGER
    },
    answer11: {
      type: Sequelize.INTEGER
    },
    answer12: {
      type: Sequelize.INTEGER
    },
    answer13: {
      type: Sequelize.INTEGER
    },
    answer14: {
      type: Sequelize.INTEGER
    },
    answer15: {
      type: Sequelize.INTEGER
    },
    answer16: {
      type: Sequelize.INTEGER
    },
    avgtotal: {
      type: Sequelize.FLOAT
    },
    avgsysuse: {
      type: Sequelize.FLOAT
    },
    avginfoqual: {
      type: Sequelize.FLOAT
    },
    avgintqual: {
      type: Sequelize.FLOAT
    },
    scoresus: {
      type: Sequelize.FLOAT
    }
  });

  return CsuqAnswers;
};
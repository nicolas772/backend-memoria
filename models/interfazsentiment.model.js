module.exports = (sequelize, Sequelize) => {
  const InterfazSentiment = sequelize.define("interfazsentiments", {
    answer: {
      type: Sequelize.TEXT
    },
    comparative: {
      type: Sequelize.FLOAT
    },
    numhits: {
      type: Sequelize.INTEGER
    },
    numwords: {
      type: Sequelize.INTEGER
    },
    score: {
      type: Sequelize.FLOAT
    },
    vote: {
      type: Sequelize.STRING
    },
  });

  return InterfazSentiment;
};
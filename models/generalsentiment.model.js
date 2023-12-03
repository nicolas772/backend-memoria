module.exports = (sequelize, Sequelize) => {
  const GeneralSentiment = sequelize.define("generalsentiments", {
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
    usersentiment: {
      type: Sequelize.STRING
    },
    falsepositive: {
      type: Sequelize.BOOLEAN,
    },
  });

  return GeneralSentiment;
};
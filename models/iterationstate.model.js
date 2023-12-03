module.exports = (sequelize, Sequelize) => {
  const IterationState = sequelize.define("iterationstates", {
    inTask: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    inCSUQ: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    inQuestion: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    lastTaskForContador: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    }
  });

  return IterationState;
};
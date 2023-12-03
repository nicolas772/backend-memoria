module.exports = (sequelize, Sequelize) => {
  const InfoTask = sequelize.define("infotasks", {
    complete: {
      type: Sequelize.BOOLEAN,
    },
    duration: {
      type: Sequelize.INTEGER
    }
  });

  return InfoTask;
};
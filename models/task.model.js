module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define("tasks", {
    title: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    dificulty: {//Facil - medio - dificil
      type: Sequelize.STRING,
    },
    minutes_optimal: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    seconds_optimal: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  });

  return Task;
};
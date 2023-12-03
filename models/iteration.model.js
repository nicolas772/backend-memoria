module.exports = (sequelize, Sequelize) => {
  const Iteration = sequelize.define("iterations", {
    state: {//Activa - Finalizada
      type: Sequelize.STRING,
      defaultValue: "Creada",
    },
    iteration_number: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    start_date: {
      type: Sequelize.DATE
    },
    end_date: {
      type: Sequelize.DATE
    },
    task_qty: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    users_qty: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    users_qty_complete: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    goal: {
      type: Sequelize.TEXT,
    }
  });

  return Iteration;
};
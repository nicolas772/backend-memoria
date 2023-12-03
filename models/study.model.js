module.exports = (sequelize, Sequelize) => {
  const Study = sequelize.define("studies", {
    software_name: {
      type: Sequelize.STRING
    },
    software_tipe: {
      type: Sequelize.STRING
    },
    url: {
      type: Sequelize.STRING
    },
    start_date: {
      type: Sequelize.DATE
    },
    end_date: {
      type: Sequelize.DATE
    },
    iteration_qty: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    max_iteration_number: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    active_iteration_qty: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }
  });

  return Study;
};
module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      level: {
        type: Sequelize.STRING
      },
      birthday: {
        type: Sequelize.DATE
      }
    });
  
    return User;
};
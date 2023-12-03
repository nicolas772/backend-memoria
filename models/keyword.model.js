module.exports = (sequelize, Sequelize) => {
    const Keyword = sequelize.define("keywords", {
      keyword: {
        type: Sequelize.STRING
      }
    });
  
    return Keyword;
  };
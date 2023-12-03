const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.study = require("../models/study.model.js")(sequelize, Sequelize);
db.iteration = require("../models/iteration.model.js")(sequelize, Sequelize);
db.task = require("../models/task.model.js")(sequelize, Sequelize)
db.iterationstate = require("../models/iterationstate.model.js")(sequelize, Sequelize)
db.infotask = require("../models/infotask.model.js")(sequelize, Sequelize)
db.csuqanswers = require("./csuqanswers.model.js")(sequelize, Sequelize)
db.interfazsentiment = require("./interfazsentiment.model.js")(sequelize, Sequelize)
db.generalsentiment = require("./generalsentiment.model.js")(sequelize, Sequelize)
db.keyword = require("./keyword.model.js")(sequelize, Sequelize)

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});

db.user.hasMany(db.study, {
  foreignKey: 'userId'
});

db.study.belongsTo(db.user);

db.study.hasMany(db.iteration, {
  foreignKey: 'studyId',
  onDelete: 'cascade', 
  hooks: true
});

db.iteration.belongsTo(db.study);

db.iteration.afterCreate(async (iteration, options) => {
  const study = await db.study.findByPk(iteration.studyId)
  study.iteration_qty += 1
  const iteration_number_new = study.max_iteration_number + 1
  iteration.iteration_number = iteration_number_new
  study.max_iteration_number = iteration_number_new
  await iteration.save()
  await study.save()
})

db.iteration.hasMany(db.task, {
  foreignKey: 'iterationId',
  onDelete: 'cascade', 
  hooks: true
});

db.task.belongsTo(db.iteration);

db.task.afterCreate(async (task, options) => {
  const iteration = await db.iteration.findByPk(task.iterationId)
  iteration.task_qty += 1
  await iteration.save()
})

db.user.hasMany(db.iterationstate, {
  foreignKey: 'userId'
});

db.task.hasMany(db.iterationstate, {
  foreignKey: 'taskId'
});

db.iteration.hasMany(db.iterationstate, {
  foreignKey: 'iterationId'
});


db.iterationstate.belongsTo(db.user);
db.iterationstate.belongsTo(db.task);
db.iterationstate.belongsTo(db.iteration);

db.user.hasMany(db.infotask, {
  foreignKey: 'userId'
});

db.task.hasMany(db.infotask, {
  foreignKey: 'taskId'
});

db.iteration.hasMany(db.infotask, {
  foreignKey: 'iterationId'
});

db.infotask.belongsTo(db.user);
db.infotask.belongsTo(db.task);
db.infotask.belongsTo(db.iteration);

db.user.hasMany(db.csuqanswers, {
  foreignKey: 'userId'
});

db.iteration.hasMany(db.csuqanswers, {
  foreignKey: 'iterationId'
});

db.csuqanswers.belongsTo(db.user);
db.csuqanswers.belongsTo(db.iteration);

db.user.hasMany(db.interfazsentiment, {
  foreignKey: 'userId'
});

db.iteration.hasMany(db.interfazsentiment, {
  foreignKey: 'iterationId'
});

db.interfazsentiment.belongsTo(db.user);
db.interfazsentiment.belongsTo(db.iteration);

db.user.hasMany(db.generalsentiment, {
  foreignKey: 'userId'
});

db.iteration.hasMany(db.generalsentiment, {
  foreignKey: 'iterationId'
});

db.generalsentiment.belongsTo(db.user);
db.generalsentiment.belongsTo(db.iteration);

db.user.hasMany(db.keyword, {
  foreignKey: 'userId'
});

db.iteration.hasMany(db.keyword, {
  foreignKey: 'iterationId'
});

db.keyword.belongsTo(db.user);
db.keyword.belongsTo(db.iteration);


db.ROLES = ["user", "tester"];

module.exports = db;
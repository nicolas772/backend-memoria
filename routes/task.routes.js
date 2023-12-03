const controller = require("../controllers/task.controller");
const infotaskController = require("../controllers/infotask.controller");
const { authJwt } = require("../middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/task/create",
  controller.create);

  app.post("/api/task/info/create",
  infotaskController.create);

  app.put("/api/task/update",
  controller.updateTask);

  app.delete("/api/task/delete",
  controller.deleteTask);
  
  app.get(
    "/api/test/tasks",
    [authJwt.verifyToken, authJwt.isTester],
    controller.getTasks
  );

  app.get(
    "/api/test/task",
    controller.getTask
  );
};
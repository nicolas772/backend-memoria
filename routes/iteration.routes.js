const controller = require("../controllers/iteration.controller");
const { authJwt } = require("../middleware");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/iteration/create",
  controller.create);

  app.put("/api/iteration/update",
  controller.updateIteration);

  app.put("/api/iteration/setState",
  controller.setStateIteration);

  app.delete("/api/iteration/delete",
  controller.deleteIteration);
  
  app.get(
    "/api/test/iterations",
    [authJwt.verifyToken, authJwt.isTester],
    controller.getIterations
  );

  app.get(
    "/api/test/iteration",
    controller.getIteration
  );
  app.get(
    "/api/test/iteration-user",
    controller.getIterationWithDataStudy
  );
};
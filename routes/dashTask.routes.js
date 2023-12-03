const { authJwt, verifyProfile } = require("../middleware");
const dashTask_controller = require("../controllers/dashTask.controller")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get(
    "/api/dashboard/task/general/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashTask_controller.cards
  );
  app.get(
    "/api/dashboard/task/general/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashTask_controller.barChart
  );
};
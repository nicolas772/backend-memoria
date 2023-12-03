const { authJwt, verifyProfile } = require("../middleware");
const dashMain_controller = require("../controllers/dashMain.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/dashboard/main/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashMain_controller.cards
  );
  app.get(
    "/api/dashboard/main/columnChart",
    [authJwt.verifyToken, authJwt.isTester],
    dashMain_controller.columnChart
  );
  app.get(
    "/api/dashboard/main/stackedBar",
    [authJwt.verifyToken, authJwt.isTester],
    dashMain_controller.stackedBar
  );
};
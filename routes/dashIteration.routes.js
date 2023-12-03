const { authJwt, verifyProfile } = require("../middleware");
const dashIteration_controller = require("../controllers/dashIteration.controller")
const dashDemogrIteration_controller = require("../controllers/dashDemogrIteration.controller")
const dashUsabilityIteration_controller = require("../controllers/dashUsabilityIteration.controller")
const dashSentimentIteration_controller = require("../controllers/dashSentimentIteration.controller")
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get(
    "/api/dashboard/iteration/general/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashIteration_controller.cards
  );
  app.get(
    "/api/dashboard/iteration/general/table-time",
    [authJwt.verifyToken, authJwt.isTester],
    dashIteration_controller.tableTime
  );
  app.get(
    "/api/dashboard/iteration/general/pie-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashIteration_controller.pieChart
  );
  app.get(
    "/api/dashboard/iteration/general/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashIteration_controller.barChart
  );
  app.get(
    "/api/dashboard/iteration/demogr/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrIteration_controller.cards
  );
  app.get(
    "/api/dashboard/iteration/demogr/pie-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrIteration_controller.pieChart
  );
  app.get(
    "/api/dashboard/iteration/demogr/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashDemogrIteration_controller.barChart
  );
  app.get(
    "/api/dashboard/iteration/usability/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashUsabilityIteration_controller.cards
  );
  app.get(
    "/api/dashboard/iteration/usability/table-avg",
    [authJwt.verifyToken, authJwt.isTester],
    dashUsabilityIteration_controller.tableAvg
  );
  app.get(
    "/api/dashboard/iteration/usability/box-plot",
    [authJwt.verifyToken, authJwt.isTester],
    dashUsabilityIteration_controller.boxPlot
  );
  app.get(
    "/api/dashboard/iteration/sentiment/cards",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentIteration_controller.cards
  );
  app.get(
    "/api/dashboard/iteration/sentiment/pie-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentIteration_controller.pieChart
  );
  app.get(
    "/api/dashboard/iteration/sentiment/carousel",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentIteration_controller.carousel
  );
  app.get(
    "/api/dashboard/iteration/sentiment/bar-chart",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentIteration_controller.barChart
  );
  app.get(
    "/api/dashboard/iteration/sentiment/cloud-word",
    [authJwt.verifyToken, authJwt.isTester],
    dashSentimentIteration_controller.cloudWord
  );
};
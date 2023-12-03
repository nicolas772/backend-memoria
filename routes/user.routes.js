const { authJwt, verifyProfile } = require("../middleware");

const controller = require("../controllers/user.controller");
const iterationstate_controller = require("../controllers/iterationstate.controller");
const csuqanswers_controller = require("../controllers/csuqanswers.controller");
const openanswer_controller = require("../controllers/openanswer.controller");
const dashMain_controller = require("../controllers/dashMain.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get(
    "/api/test/user",
    [authJwt.verifyToken, authJwt.isUser],
    controller.userBoard
  );

  app.get(
    "/api/test/next-task",
    [authJwt.verifyToken, authJwt.isUser],
    iterationstate_controller.getNextTaskForStudy
  );

  app.post(
    "/api/test/csuq-answers",
    csuqanswers_controller.create
  );

  app.post(
    "/api/test/open-answer",
    openanswer_controller.create
  );
  app.post(
    "/api/test/open-answer-prueba",
    openanswer_controller.prueba
  );

  app.put(
    "/api/test/update-profile",
    [verifyProfile.checkDuplicateUsernameOrEmail],
    controller.updateProfile
  );
  app.put(
    "/api/test/update-pass",
    controller.updatePass
  );
};
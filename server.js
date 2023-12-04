const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const Role = db.role;

const app = express();

var corsOptions = {
  origin: "https://feelux.onrender.com"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to application." });
});

//synchronizing the database and forcing it to false so we dont lose data
db.sequelize.sync({force: false}).then(() => {
    console.log('Drop and Resync Db');
    //initial();
});

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/study.routes')(app);
require('./routes/iteration.routes')(app);
require('./routes/task.routes')(app);
require('./routes/dashMain.routes')(app);
require('./routes/dashStudy.routes')(app);
require('./routes/dashIteration.routes')(app);
require('./routes/dashTask.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
    Role.create({
      id: 1,
      name: "user"
    });
   
    Role.create({
      id: 2,
      name: "tester"
    });
}
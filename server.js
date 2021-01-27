const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer =  require('multer');
const upload = multer( { dest : '/api/upload' } );

const app = express();
const db = require("./models");
const Role = db.role;
db.mongoose
  .connect("mongodb://localhost:27017/manage_rr", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
    initial();
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

var corsOptions = {
  origin: "https://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ManageRR application." });
});

require("./routes/grid.routes")(app);
require("./routes/auth.routes")(app);
require('./routes/user.routes')(app);
require('./routes/roles.routes')(app);
require('./routes/project.routes')(app);
require('./routes/schedule.routes')(app);
require('./routes/event.routes')(app);
require('./routes/link.routes')(app);
require('./routes/import.routes')(app);

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
        readOnly: true,
        canCreate: false,
        canUpdate: false,
        canUpdateStage: false,
        financial: false,
        financialGlobal: false,
        pmResource: false,
        kamResource: false,
        resource: false,
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "pm",
        readOnly: false,
        canCreate: true,
        canUpdate: true,
        canUpdateStage: true,
        financial: false,
        financialGlobal: false,
        pmResource: true,
        kamResource: false,
        resource: false,
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "kam",
        readOnly: false,
        canCreate: true,
        canUpdate: true,
        canUpdateStage: true,
        financial: true,
        financialGlobal: false,
        pmResource: true,
        kamResource: true,
        resource: false,
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });

      new Role({
        name: "admin",
        readOnly: false,
        canCreate: true,
        canUpdate: true,
        canUpdateStage: true,
        financial: true,
        financialGlobal: true,
        pmResource: true,
        kamResource: true,
        resource: true,
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

// set port, listen for requests
const PORT = process.env.PORT_SERVER || 8080
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

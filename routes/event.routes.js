const events = require("../controllers/event.controller.js");
const { authJwt } = require("../middlewares");
module.exports = app => {
  
    var router = require("express").Router();

    //Create a new event
    router.post("/",[authJwt.verifyToken], events.create);

    //Retrieve all Owner's events
    router.get("/user/:user",[authJwt.verifyToken], events.findAllOwnerEvents);

    //Update an event
    router.put("/:id",[authJwt.verifyToken,  authJwt.isPm || authJwt.isKam ], events.update);

    //Delete an event with id
    router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], events.delete)

    //Get All events
    router.get("/", [authJwt.verifyToken, authJwt.isAdmin], events.findAll);

    //Get All events
    router.get("/admin", [authJwt.verifyToken, authJwt.isAdmin], events.findAdminEvents);
  
    app.use('/api/events', router);
  };
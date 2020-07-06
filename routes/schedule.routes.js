const schedules = require("../controllers/schedule.controller.js");
module.exports = app => {

  
    var router = require("express").Router();

    //Create a new Schedule
    router.post("/", schedules.create);

    //Update schedule in a Project

    router.put("/:id", schedules.update);

    //Delete a Schedule with id
    router.delete("/", schedules.delete)
  
    app.use('/api/schedule', router);
  };
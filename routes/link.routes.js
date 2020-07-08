const links = require("../controllers/link.controller.js");
module.exports = app => {

  
    var router = require("express").Router();

    //Create a new Schedule
    router.post("/", links.create);

    //Update link in a Project

    router.put("/:id", links.update);

    //Delete a Schedule with id
    router.delete("/", links.delete)
  
    app.use('/api/link', router);
  };
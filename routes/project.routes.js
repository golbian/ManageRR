const projects = require("../controllers/project.controller.js");
module.exports = app => {

  
    var router = require("express").Router();
  
    // Create a new Project
    router.post("/", projects.create);
  
    // Retrieve all Projects
    router.get("/", projects.findAll);
  
    // Retrieve all published Projects
    router.get("/published", projects.findAllPublished);
  
    // Retrieve a single Project with id
    router.get("/:id", projects.findOne);
  
    // Update a Project with id
    router.put("/:id", projects.update);
  
    // Delete a Project with id
    router.delete("/:id", projects.delete);
  
    // Create a new Project
    router.delete("/", projects.deleteAll);
  
    app.use('/api/projects', router);
  };
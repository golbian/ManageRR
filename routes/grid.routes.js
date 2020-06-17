module.exports = app => {
    const grids = require("../controllers/grid.controller.js");
  
    var router = require("express").Router();
  
    // Create a new Grid
    router.post("/", grids.create);
  
    // Retrieve all Grids
    router.get("/", grids.findAll);
  
    // Retrieve all published Grids
    router.get("/published", grids.findAllPublished);
  
    // Retrieve a single Grid with id
    router.get("/:id", grids.findOne);
  
    // Update a Grid with id
    router.put("/:id", grids.update);
  
    // Delete a Grid with id
    router.delete("/:id", grids.delete);
  
    // Create a new Grid
    router.delete("/", grids.deleteAll);
  
    app.use('/api/grids', router);
  };
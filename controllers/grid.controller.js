const db = require("../models");
const Grid = db.grid;

// Create and Save a new Grid
exports.create = (req, res) => {
   // Validate request
   if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const grid = new Grid({
    name: req.body.name,
    state: req.body.state
  });

  // Save Grid in the database
  grid
    .save(grid)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Grid state."
      });
    });
};

// Retrieve all Grids from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  
    Grid.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving grids."
        });
      });
  };

// Find a single Grid with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Grid.findById(id)
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Grid with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Grid with id=" + id });
      });
  };

// Update a Grid by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.params.id;
  
    Grid.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Grid with id=${id}. Maybe Grid was not found!`
          });
        } else res.send({ message: "Grid was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: "Error updating Grid with id=" + id
        });
      });
  };

// Delete a Grid with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Grid.findByIdAndRemove(id)
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Grid with id=${id}. Maybe Grid was not found!`
          });
        } else {
          res.send({
            message: "Grid was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Grid with id=" + id
        });
      });
  };

// Delete all Grids from the database.
exports.deleteAll = (req, res) => {
    Grid.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} Grids were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all grids."
        });
      });
  };

// Find all published Grids
exports.findAllPublished = (req, res) => {
    Grid.find({ published: true })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving grids."
        });
      });
  };
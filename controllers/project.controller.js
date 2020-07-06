const db = require("../models");
const mongoose = require("mongoose");
const Project = db.project;

// Create and Save a new Project
exports.create = (req, res) => {
   // Validate request
   if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const project = new Project({
    _id: req.body._id,
    projectName: req.body.projectName,
    type: req.body.type,
    client: req.body.client,
    duration: req.body.duration,
    status: req.body.status,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    parent: req.body.parent,
    progress: req.body.progress,
    charge: req.body.charge,
    budget: req.body.budget,
    ssTrt: req.body.ssTrt,
    link: req.body.link,
  });

  // Save Project in the database
  project
    .save(project)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Project state."
      });
    });
};

// Retrieve all Projects from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  
    Project.find(condition)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving projects."
        });
      });
  };

// Find a single Project with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
  
    Project.findById(id)
      .then(data => {
        if (!data)
          res.status(404).send({ message: "Not found Project with id " + id });
        else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving Project with id=" + id });
      });
  };

// Update a Project by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }

    console.log(req.body);
  
    const id = req.params.id;
  
    Project.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Project with id=${id}. Maybe Project was not found!`
          });
        } else res.send({ message: "Project was updated successfully." });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Project with id=" + id
        });
      });
  };

// Delete a Project with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    console.log(id)
  
    Project.findOneAndDelete({_id : id}, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Project with id=${id}. Maybe Project was not found!`
          });
        } else {
          res.send({
            message: "Project with id="+ id +" was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Project with id=" + id
        });
      });
  };

// Delete all Projects from the database.
exports.deleteAll = (req, res) => {
    Project.deleteMany({})
      .then(data => {
        res.send({
          message: `${data.deletedCount} Projects were deleted successfully!`
        });
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all projects."
        });
      });
  };

// Find all published Projects
exports.findAllPublished = (req, res) => {
    Project.find({ published: true })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving projects."
        });
      });
  };
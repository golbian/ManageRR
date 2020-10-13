const db = require("../models");
const mongoose = require("mongoose");
const Event = db.event;

// Create and Save a new Event
exports.create = (req, res) => {
   // Validate request
   if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  const event = new Event({
    _id: req.body.id,
    projectName: req.body.projectName,
    client: req.body.client,
    projects: req.body.projects,
    deliverable: req.body.deliverable,
    project_id: req.body.project_id,
    schedule_id: req.body.schedule_id,
    activityName: req.body.activityName,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    tps: req.body.tps,
    duration: req.body.duration,
    insitu: req.body.insitu
  });

  // Save Event in the database
  event
    .save(event)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Event state."
      });
    });
};

// Retrieve all Events from the database.
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
  
    Event.find(condition).then(data => {
        if(data) {
            res.send(data);
        }

        else {
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving events."
            });
          }
    })

};

// Find a single Event with an id
// exports.findOne = (req, res) => {
//     const id = req.params.id;
  
//     Event.findById(id)
//       .populate({
//         path: 'schedules.resources',
//         populate: { path: 'resources' }
//       })
//       .then(data => {
//         if (!data)
//           res.status(404).send({ message: "Not found Event with id " + id });
//         else {
//           res.send(data);
//         }
//       })
//       .catch(err => {
//         res
//           .status(500)
//           .send({ message: "Error retrieving Event with id=" + id });
//       });
//   };

// Update a Event by the id in the request
exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.params.id;
  
    Event.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Event with id=${id}. Maybe Event was not found!`
          });
        } else res.send({ message: "Event was updated successfully." });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Event with id=" + id
        });
      });
  };

// Delete a Event with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
  
    Event.findOneAndDelete({_id : id}, { useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Event with id=${id}. Maybe Event was not found!`
          });
        } else {
          res.send({
            message: "Event with id="+ id +" was deleted successfully!"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Event with id=" + id
        });
      });
  };

// Delete all Projects from the database.
exports.deleteAll = (req, res) => {
    Event.deleteMany({})
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
    Event.find({ published: true })
    .populate({
      path: 'schedules.resources',
      populate: { path: 'resources' },
      select: "username"
    })
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

  exports.findAllOwnerEvent = (req, res) => {
    Event.find({ pm: req.params.id })
    .populate({
      path: 'projects',
      populate: { path: 'projects' },
      select: "id"
    })
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
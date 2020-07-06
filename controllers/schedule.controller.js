const db = require("../models");
const mongoose = require("mongoose");
const Project = db.project;

exports.create = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  console.log(req.body);

  const id = req.body._id;

  Project.findByIdAndUpdate({_id: id}, {$push: { schedules: req.body.schedule}}, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot create Schedule. Maybe Project was not found!`
        });
      } else res.send({ message: "Schedule was created successfully." });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Error creating Schedule"
      });
    });
};

  exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }

    console.log(req.body);
  
    const id = req.body._id;
    const scheduleId = req.body.schedule._id
  
    Project.findOneAndUpdate(
       {_id: id, "schedules._id": scheduleId},
       {
        "schedules.$.start_date": req.body.schedule.start_date,
        "schedules.$.duration": req.body.schedule.duration,
        "schedules.$.parent": req.body.schedule.parent,
        "schedules.$.end_date": req.body.schedule.end_date,
        "schedules.$.name": req.body.schedule.name,
        "schedules.$.contract": req.body.schedule.contract,
        "schedules.$.exoN": req.body.schedule.exoN,
        "schedules.$.ressource": req.body.schedule.ressource,
        "schedules.$.achat": req.body.schedule.achat,
        "schedules.$.itempo": req.body.schedule.itempo,
        "schedules.$.facture": req.body.schedule.facture,
        "schedules.$.fraisA": req.body.schedule.fraisA,
        "schedules.$.fraisR": req.body.schedule.fraisR
      },{ useFindAndModify: false }
  )
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Schedule with id=${scheduleId} in Project with id=${id}. Maybe Schedule was not found!`
          });
        } else res.send({ message: "Schedule was updated successfully." });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Schedule with id=" + id
        });
      });
  };

  // Delete a Schedule with the specified id in the request
exports.delete = (req, res) => {
  const id = req.body.projectId;
  const scheduleId = req.body.scheduleId;

  console.log(req.body);

  Project.findOneAndUpdate({_id: id }, { $pull: {schedules:{_id : scheduleId}}},{ useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Schedule with id=${scheduleId}. Maybe Schedule was not found!`
        });
      } else {
        res.send({
          message: "Schedule with id= " + scheduleId + "was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Schedule with id=" + scheduleId
      });
    });
};
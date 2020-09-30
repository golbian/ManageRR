const db = require("../models");
const mongoose = require("mongoose");
const { project } = require("../models");
const Project = db.project;
const User = db.user;

exports.create = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.body._id;

  Project.findByIdAndUpdate({_id: id}, {$push: { schedules: req.body.schedule}}, { useFindAndModify: false })
    .then(data => {
      console.log(data);
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

exports.findOne = (req, res) => {
  const id = req.params.projectId;
  const scheduleId = req.params.scheduleId;
  if(!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }
  Project.findOne({_id: id, "schedules._id": scheduleId},{ 'schedules.$._id': scheduleId })
  .then(data => {
    if (!data)
      res.status(404).send({ message: "Not found Schedule with id " + id });
    else {
      res.send(data);
    }
  })
  .catch(err => {
    res
      .status(500)
      .send({ message: "Error retrieving Schedule with id=" + id });
  });
}

  exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.body._id;
    const scheduleId = req.body.schedule._id;

    Project.findOneAndUpdate(
       {_id: id, "schedules._id": scheduleId},
       {
        "schedules.$.start_date": req.body.schedule.start_date,
        "schedules.$.duration": req.body.schedule.duration,
        "schedules.$.parent": req.body.schedule.parent,
        "schedules.$.client": req.body.schedule.client,
        "schedules.$.status": req.body.schedule.status,
        "schedules.$.type": req.body.schedule.type, 
        "schedules.$.progress": req.body.schedule.progress,
        "schedules.$.end_date": req.body.schedule.end_date,
        "schedules.$.name": req.body.schedule.name,
        "schedules.$.contract": req.body.schedule.contract,
        "schedules.$.resources": req.body.schedule.resources,
        "schedules.$.country": req.body.schedule.country,
        "schedules.$.kam": req.body.schedule.kam,
        "schedules.$.charge": req.body.schedule.charge,
        // "schedules.$.pm": req.body.schedule.pm,
        "schedules.$.stage": req.body.schedule.stage,
        "schedules.$.etp": req.body.schedule.etp,
        "schedules.$.domaine": req.body.schedule.domaine,
        "schedules.$.ca": req.body.schedule.ca,
        "schedules.$.comments": req.body.schedule.comments,
        "schedules.$.temp": req.body.schedule.temp,
      },{ useFindAndModify: false }
    )
      .then(data => {
        if(req.body.isAdmin) {
          for(const resource of req.body.schedule.resources) {
            User.findOneAndUpdate({_id: resource._id},{$set: { value: resource.value }, $addToSet: { projects: id }},{ useFindAndModify: false }).then(data => {
              if(!data) {
                  console.log(`Cannot update User value with id=${resource._id} in schedule(${scheduleId}) for Project with id=${id}`)
              } else console.log("User value was updated successfully.");
            })
            .catch(err => {
              console.log(err);
              console.log(
                "Error updating User value with id=" + resource._id
              );
            });
          }
        }
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
  console.log(req.params)
  const id = req.params.projectId;
  const scheduleId = req.params.scheduleId;

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
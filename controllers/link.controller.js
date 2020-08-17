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

  Project.findByIdAndUpdate({_id: id}, {$push: { links: req.body.link}}, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot create Link. Maybe Project was not found!`
        });
      } else res.send({ message: "Link was created successfully." });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        message: "Error creating Link"
      });
    });
};

  exports.update = (req, res) => {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!"
      });
    }
  
    const id = req.body._id;
    const linkId = req.body.link._id
  
    Project.findOneAndUpdate(
       {_id: id, "links._id": linkId},
       {
        "links.$.source": req.body.link.source,
        "links.$.target": req.body.link.target,
        "links.$.type": req.body.link.type,
      },{ useFindAndModify: false }
  )
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Link with id=${linkId} in Project with id=${id}. Maybe Link was not found!`
          });
        } else res.send({ message: "Link was updated successfully." });
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          message: "Error updating Link with id=" + id
        });
      });
  };

  // Delete a Link with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.projectId;
  const linkId = req.params.linkId;

  Project.findOneAndUpdate({_id: id }, { $pull: {links:{_id : linkId}}},{ useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Link with id=${linkId}. Maybe Link was not found!`
        });
      } else {
        res.send({
          message: "Link with id= " + linkId + "was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Link with id=" + linkId
      });
    });
};
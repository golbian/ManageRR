module.exports = mongoose => {
    var Schema = mongoose.Schema({
        name: String,
        readOnly: Boolean,
        canCreate: Boolean,
        canUpdate: Boolean,
        canUpdateStage: Boolean,
        financial: Boolean,/*debours, ca*/
        pmResource: Boolean,
        kamResource: Boolean,
        resource: Boolean,
    });

const Role = mongoose.model("role", Schema);
    return Role;
  };
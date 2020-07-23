module.exports = mongoose => {
    var Schema = mongoose.Schema({
        name: String,
        readOnly: Boolean,
        canCreate: Boolean,
        canUpdate: Boolean,
    });

const Role = mongoose.model("role", Schema);
    return Role;
  };
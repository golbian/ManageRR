module.exports = mongoose => {
    var Schema = mongoose.Schema({
        name: String,
        gridInit: Object,
    });

const Role = mongoose.model("role", Schema);
    return Role;
  };
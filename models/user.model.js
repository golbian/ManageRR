module.exports = mongoose => {
  var Schema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ]
  }, 
  { timestamps: true }
  )
  const User = mongoose.model("user", Schema);
  return User;
};

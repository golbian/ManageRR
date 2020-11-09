module.exports = mongoose => {
  var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    sigle: String,
    value: Number,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
      }
    ],
  }, 
  { timestamps: true }
  )

  userSchema.virtual('resource_id').get(function(){
    return this._id;
  });

  // Ensure virtual fields are serialised.
  userSchema.set('toJSON', {
    virtuals: true
  });
  const User = mongoose.model("user", userSchema);
  return User;
};

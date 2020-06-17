module.exports = mongoose => {
    var Schema = mongoose.Schema(
        {
          name: String,  
          state: Array,
        },
        { timestamps: true }
      );

    // Duplicate the ID field.
    Schema.virtual('id').get(function(){
        return this._id.toHexString();
    });

    // Ensure virtual fields are serialised.
    Schema.set('toJSON', {
        virtuals: true
    });
    
    const Grid = mongoose.model("grid", Schema);
    return Grid;
  };
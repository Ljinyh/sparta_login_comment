const mongoose = require('mongoose');
const ContentsSchema = mongoose.Schema(
    {
        title: 
        { type: String },
        content: 
        { type: String },
        userId:
        { type : String,
          required: true},
        articlePassword: 
        { type: String },
    },
        { timestamps: true }
    );

    
    ContentsSchema.virtual("contentId").get(function () {
    return this._id.toHexString();
  });
  ContentsSchema.set("toJSON", {
    virtuals: true,
  });

module.exports = mongoose.model('Contents', ContentsSchema);
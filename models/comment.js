const mongoose = require('mongoose');
const CommentSchema = mongoose.Schema(
    {  
        contentId: 
        { type : String },
        userId:
        { type : String },
        comment: 
        {type: String},
    },
    { timestamps: true }
);


CommentSchema.virtual("commentId").get(function () {
    return this._id.toHexString();
  });
  CommentSchema.set("toJSON", {
    virtuals: true,
  });

module.exports = mongoose.model('Comments', CommentSchema);
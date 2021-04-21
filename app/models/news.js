var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var newsSchema = new Schema({
    title: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: ""
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      },
   }, { versionKey: false, timestamps:true });

newsSchema.plugin(mongoosePaginate);
let Newsmodel = mongoose.model('news', newsSchema);
module.exports = Newsmodel;
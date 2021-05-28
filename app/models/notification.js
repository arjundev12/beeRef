var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var notificationSchema = new Schema({
    title: {
        type: String
    },
    subtitle: {
        type: String
    },
    type: {
        type: String
    },
    toId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    fromId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    viewer_id: {
        type: { any: [Schema.Types.Mixed] }
    },

}, { versionKey: false });

notificationSchema.plugin(mongoosePaginate);
let NotificationModel = mongoose.model('notification', notificationSchema);
module.exports = NotificationModel;
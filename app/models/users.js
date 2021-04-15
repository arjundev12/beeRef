var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var UsersSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    index: true,
    unique: true ,
    require: true
  },
  email: {
    type: String,
    trim: true,
    require: true
  },
  password: {
    type: String,
    trim: true,
  },
  number: {
    type: String,
    trim: true,
    default:""
  },
  profile_pic: {
    type: String,
    trim: true,
    default:""
  },
  block_user: {
    type: String,
    enum: ['1', '0'],
    default: '0'
  },
  country: {
    type: String,
    trim: true
  },
  user_type: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  is_email_verify: {
    type: String,
    values: ['1', '0'],
    default: '0'
  },
  is_number_verify: {
    type: String,
    values: ['1', '0'],
    default: '0'
  },
  current_rank: {
    type: String,
    default: '0'
  },
  // values: ['facebook', 'google', 'apple', 'manual']
  login_type: {
    type: String,
    enum: ['facebook', 'google', 'apple', 'manual']
  },
  social_media_key: {
    type: String,
  },
  is_super_admin: {
    type: String,
    values: ['0', '1'],
    default: '0'
  },
  location: {
    type: String,
    trim: true,
  },
  Referral_id: {
    type: String,
    trim: true,
  },
  // {
  //   status:
  //   _id
  // }
  ref_to_users: {
    type: { any: [Schema.Types.Mixed] }
  },
  minner_Activity:{
    type: Boolean,
    default:false
  },
  profile_details: {
    type: { any: [Schema.Types.Mixed] }
  }
}, { timestamps: true });
UsersSchema.plugin(mongoosePaginate);
let UsersModel = mongoose.model('users', UsersSchema);
UsersModel.createIndexes();
module.exports = UsersModel;
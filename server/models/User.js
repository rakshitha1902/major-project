const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  fileName: String,
  fileContent: String,
  bytecode: String,
  rgbImage: String,
  vulnerabilities: [
    {
      category: String,
      value: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  projects: [ProjectSchema],
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;


// const UserSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     password: String,
//     projects: [
//        {
//          name: {
//            type: String,
//            required: true,
//            validate: {
//              validator: function (v) {
//                return this.model('users').countDocuments({ 'projects.name': v }, { _id: 0 }) === 0;
//              },
//              message: 'A project with this name already exists.',
//            },
//          },
//          fileName: String,
//          fileContent: String,
//          createdAt: { type: Date, default: Date.now },
//          updatedAt: { type: Date, default: Date.now },
//        },
//     ],
// });

// const UserModel = mongoose.model("users", UserSchema)
// module.exports = UserModel
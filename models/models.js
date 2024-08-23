const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Post = sequelize.define('post', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title: {type: DataTypes.STRING},
  description: {type: DataTypes.STRING},
  cover: {type: DataTypes.STRING},
  html: {type: DataTypes.TEXT},
  views: {type: DataTypes.INTEGER}
})

const Case_blocks = sequelize.define('case_blocks', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  text: {type: DataTypes.TEXT},
  attachment: {type: DataTypes.STRING},
  type_block: {type: DataTypes.STRING},
  attachment_title: {type: DataTypes.STRING},
  mobile_version: {type: DataTypes.STRING},
  desktop_version: {type: DataTypes.STRING},
})

const Color_shem = sequelize.define('color_shem', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  base_color: {type: DataTypes.STRING},
  accent_color: {type: DataTypes.STRING}
})

const Nuance_color  = sequelize.define('nuance_color', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  color: {type: DataTypes.STRING}
})

const Tag  = sequelize.define('tag', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Post_attachments = sequelize.define('post_attachments', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  url: {type: DataTypes.STRING},

})

const Case = sequelize.define('case', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  customer: {type: DataTypes.STRING},
  description: {type: DataTypes.TEXT},
  cover: {type: DataTypes.STRING}
})

const Case_attachments = sequelize.define('case_attachments', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Service = sequelize.define('service', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  price: {type: DataTypes.INTEGER}
})

const Comment = sequelize.define('сomment', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  username: {type: DataTypes.STRING},
  text: {type: DataTypes.TEXT}
})

//Relationships

Post.hasMany(Post_attachments)
Post_attachments.belongsTo(Post)

Tag.hasMany(Post)
Post.belongsTo(Tag)

Case.hasMany(Case_attachments)
Case_attachments.belongsTo(Case)

Tag.hasMany(Case)
Case.belongsTo(Tag)

Case.hasMany(Case_blocks)
Case_blocks.belongsTo(Case)

Case_blocks.hasMany(Color_shem)
Color_shem.belongsTo(Case_blocks)

Color_shem.hasMany(Nuance_color)
Nuance_color.belongsTo(Color_shem)

Comment.hasMany(Comment)
Comment.belongsTo(Comment)

Post.hasMany(Comment)
Comment.belongsTo(Post)

module.exports = {
  Post, Post_attachments, Case, Case_attachments, Comment, Service, Case_blocks, Nuance_color, Color_shem, Tag,
}
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

const Post_category = sequelize.define('post_category', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Post_attachments = sequelize.define('post_attachments', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Case = sequelize.define('case', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  customer: {type: DataTypes.STRING},
  description: {type: DataTypes.TEXT},
  cover: {type: DataTypes.STRING},
  html: {type: DataTypes.TEXT},
})

const Case_attachments = sequelize.define('case_attachments', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Service = sequelize.define('service', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Comment = sequelize.define('service', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  username: {type: DataTypes.STRING},
  text: {type: DataTypes.TEXT}
})

//Relationships

Post_category.hasMany(Post)
Post.belongsTo(Post_category)

Post.hasMany(Post_attachments)
Post_attachments.belongsTo(Post)

Case.hasMany(Case_attachments)
Case_attachments.belongsTo(Case)

Comment.hasMany(Comment)
Comment.belongsTo(Comment)

Post.hasMany(Comment)
Comment.belongsTo(Post)

module.exports = {
  Post, Post_category, Post_attachments, Case, Case_attachments, Comment, Service
}
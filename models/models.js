const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const Post = sequelize.define('post', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  title: {type: DataTypes.STRING},
  description: {type: DataTypes.TEXT},
  cover: {type: DataTypes.STRING},
  html: {type: DataTypes.TEXT},
  views: {type: DataTypes.INTEGER},
  keywords: {type: DataTypes.TEXT}
})

const Case_blocks = sequelize.define('case_blocks', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  text: {type: DataTypes.TEXT},
  attachment: {type: DataTypes.STRING},
  type_block: {type: DataTypes.STRING},
  description: {type: DataTypes.TEXT},
  attachment_title: {type: DataTypes.STRING},
  mobile_version: {type: DataTypes.STRING},
  desktop_version: {type: DataTypes.STRING},
})

const Color_shem = sequelize.define('color_shem', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  base_color: {type: DataTypes.STRING},
  accent_color: {type: DataTypes.STRING}
})

const Nuance_color = sequelize.define('nuance_color', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  color: {type: DataTypes.STRING}
})

const Tag = sequelize.define('tag', {
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
  cover: {type: DataTypes.STRING},
  keywords: {type: DataTypes.TEXT}
})

const Case_attachments = sequelize.define('case_attachments', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING}
})

const Service = sequelize.define('service', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  price: {type: DataTypes.INTEGER},
  description: {type: DataTypes.TEXT},
  image_url: {type: DataTypes.TEXT},
  active: {type: DataTypes.BOOLEAN, defaultValue: true},
})

const Functional = sequelize.define('functional', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  price: {type: DataTypes.INTEGER},
  days: {type: DataTypes.INTEGER},
  description: {type: DataTypes.TEXT},
  file: {type: DataTypes.STRING},
  checked: {type: DataTypes.BOOLEAN},
})

const Lead = sequelize.define('lead', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: DataTypes.STRING},
  contact: {type: DataTypes.STRING},
})

const Service_post = sequelize.define('service_post', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
})

const Lead_content = sequelize.define('lead_content', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  functional_name: {type: DataTypes.STRING}
})

const Comment = sequelize.define('сomment', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  username: {type: DataTypes.STRING},
  text: {type: DataTypes.TEXT},
  parentCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
})

const Faq = sequelize.define('faq', {
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  header: {type: DataTypes.TEXT},
  content: {type: DataTypes.TEXT}
})

//Relationships
Lead.hasMany(Lead_content)
Lead_content.belongsTo(Lead)

Functional.hasMany(Lead_content)
Lead_content.belongsTo(Functional)

Service.hasMany(Functional)
Functional.belongsTo(Service)

Service.hasMany(Service_post)
Service_post.belongsTo(Service)

Post.hasMany(Service_post)
Service_post.belongsTo(Post)

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

Comment.hasMany(Comment, {as: 'Replies', foreignKey: 'parentCommentId'});
Comment.belongsTo(Comment, {as: 'ParentComment', foreignKey: 'parentCommentId'});

Post.hasMany(Comment)
Comment.belongsTo(Post)

module.exports = {
  Post,
  Post_attachments,
  Case,
  Case_attachments,
  Comment,
  Service,
  Case_blocks,
  Nuance_color,
  Color_shem,
  Tag,
  Service_post,
  Lead,
  Functional,
  Lead_content,
  Faq
}
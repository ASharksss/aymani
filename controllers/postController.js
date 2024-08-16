const {Service, Post, Post_attachments, Post_category, Case, Case_attachments} = require("../models/models");
const {v4: uuidv4} = require('uuid');
const path = require('path')
const fs = require("fs");

class PostController {
  async createPost(req, res) {
    try {
      let {html, title, description, postCategoryId} = req.body
      let post
      let saveImages = []
      let coverName
      if (!req.files || !req.files.cover) {
        return res.json('Файл изображения обложки отсутствует');
      }
      let cover = req?.files?.cover
      let images = req?.files?.images
      if (cover) {
        const coverTypeFile = cover.name.split('.').pop();
        if (coverTypeFile !== 'jpeg' && coverTypeFile !== 'png' && coverTypeFile !== 'jpg') {
          return res.json('Неподходящее расширение файла для обложки');
        }
        coverName = `${uuidv4()}.${coverTypeFile}`;
        await cover.mv(path.resolve(__dirname, '..', 'static/post_covers', coverName));
      }
      post = await Post.create({
        html,
        title,
        description,
        postCategoryId,
        cover: `/static/post_covers/${coverName}`,
        views: 0
      })
      if (images) {
        let newHtml = html
        for (let item of images) {
          let imagesTypeFile = item.name.split('.').pop();
          if (imagesTypeFile !== 'jpeg' && imagesTypeFile !== 'png' && imagesTypeFile !== 'jpg') {
            return res.json('Неподходящее расширение файла для вложения');
          }
          let imageName = `${uuidv4()}.${imagesTypeFile}`;
          await item.mv(path.resolve(__dirname, '..', 'static/post_images', imageName));
          const imageUrl = `/static/post_images/${imageName}`;
          // Обновление имен файлов изображений в HTML
          newHtml = newHtml.replace(item.name, imageUrl);
          await Post_attachments.create({name: imageName, postId: post.id, url: `/static/post_images/${imageName}`})
            .then(() => saveImages.push(imageName))
          await Post.update(
            {html: newHtml},
            {where: {id: post.id}}
          )
        }
      }
      return res.json({post, saveImages})
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getAllPosts(req, res) {
    try {
      const posts = await Post.findAll({
        attributes: ['id', 'title', 'description', 'views', 'cover', 'postCategoryId'],
        include: [{model: Post_category, attributes: ['id', 'name']}],
        order: [['createdAt', 'DESC']]
      })
      return res.json(posts)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getPost(req, res) {
    try {
      const {id} = req.params
      const post = await Post.findOne({
        where: {id},
        include: [{model: Post_category, attributes: ['name']}]
      })
      return res.json(post)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async deletePost(req, res) {
    try {
      const {id} = req.body
      const files = await Post_attachments.findAll({where: {postId: id}, attributes: ['id', 'name']})
      for (let item of files) {
        const folderPath = path.join(__dirname, '..', 'static/post_images');
        const filePath = path.join(folderPath, item.name);
        await fs.promises.unlink(filePath);
        await Post_attachments.destroy({where: {id: item.id}})
      }
      const post = await Post.findOne({where: id})
      if (post) {
        const coverFileName = path.basename(post.cover);
        const folderPath = path.join(__dirname, '..', 'static/post_covers');
        const filePath = path.join(folderPath, coverFileName);
        await fs.promises.unlink(filePath);
      }
      await Post.destroy({where: {id}})
      return res.json(post)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async createCase(req, res) {
    try {
      const {name, customer, description, html} = req.body
      const cover = req?.files?.cover
      const images = req?.files?.images
      let saveImages = []
      let coverName
      if (cover) {
        const coverTypeFile = cover.name.split('.').pop();
        if (coverTypeFile !== 'jpeg' && coverTypeFile !== 'png' && coverTypeFile !== 'jpg') {
          return res.json('Неподходящее расширение файла для обложки');
        }
        coverName = `${uuidv4()}.${coverTypeFile}`;
        await cover.mv(path.resolve(__dirname, '..', 'static/case_covers', coverName));
      }
      let case_item = await Case.create({
        name, customer, description, html, cover: `static/case_covers/${coverName}`
      })
      if (images) {
        let newHtml = html
        for (let item of images) {
          let imagesTypeFile = item.name.split('.').pop();
          if (imagesTypeFile !== 'jpeg' && imagesTypeFile !== 'png' && imagesTypeFile !== 'jpg') {
            return res.json('Неподходящее расширение файла для вложения');
          }
          let imageName = `${uuidv4()}.${imagesTypeFile}`;
          await item.mv(path.resolve(__dirname, '..', 'static/case_images', imageName));
          const imageUrl = `/static/case_images/${imageName}`;
          // Обновление имен файлов изображений в HTML
          newHtml = newHtml.replace(item.name, imageUrl);
          await Case_attachments.create({name: imageName, caseId: case_item.id})
            .then(() => saveImages.push(imageName))
          await Case.update(
            {html: newHtml},
            {where: {id: case_item.id}}
          )
        }
      }
      return res.json(case_item)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async createService(req, res) {
    try {
      const arr = req.body
      let correct = []
      for (let item of arr) {
        await Service.create({name: item.name, price: item.price})
          .then(() => correct.push(item))
      }
      return res.json(correct)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

}

module.exports = new PostController()
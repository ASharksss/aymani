const {
  Service,
  Post,
  Post_attachments,
  Post_category,
  Case,
  Case_attachments,
  Case_blocks, Tag, Color_shem, Nuance_color
} = require("../models/models");
const {v4: uuidv4} = require('uuid');
const path = require('path')
const fs = require("fs");

class PostController {
  async createPost(req, res) {
    try {
      let {html, title, description, tagId} = req.body
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
        tagId,
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
        attributes: ['id', 'title', 'description', 'views', 'cover', 'tagId'],
        include: [{model: Tag, attributes: ['id', 'name']}],
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
        include: [{model: Tag, attributes: ['id', 'name']}]
      })
      return res.json(post)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async deletePost(req, res) {
    try {
      const {id} = req.params
      const files = await Post_attachments.findAll({where: {postId: id}, attributes: ['id', 'name']})
      for (let item of files) {
        const folderPath = path.join(__dirname, '..', 'static/post_images');
        const filePath = path.join(folderPath, item.name);
        await fs.promises.unlink(filePath);
        await Post_attachments.destroy({where: {id: item.id}})
      }
      const post = await Post.findOne({where: {id}})
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
    const block = [
      {
        "type": "Планирование",
        "text": "Описание",
        "image": "photo_2023-08-02_06-17-07.jpg",
        "attachment_title": "Джоня, в постельке",
        "colors": null
      },
      {
        "type": "Дизайн",
        "text": "Описание",
        "image": "photo_2023-09-03_10-44-08.jpg",
        "attachment_title": "Джоня утром, в постельке",
        "colors": {
          "base": "blue",
          "nuans": ["black", "gray", "white"],
          "focus": "red"
        }
      },
      {
        "type": "Кодинг",
        "text": "Описание",
        "image": null,
        "attachment_title": "Джоня, в постельке",
        "colors": null
      }
    ]

    try {
      const case_item = req.body
      const files = req.files.files
      const cover = req.files.cover
      let coverName, coverTypeFile
      let imageName, imageTypeFile

      if (cover) {
        coverTypeFile = cover.name.split('.').pop()
        coverName = `${uuidv4()}.${coverTypeFile}`;
        await cover.mv(path.resolve(__dirname, '..', 'static/case_covers', coverName));
      }
      let box = await Case.create({
        name: case_item.name,
        customer: case_item.customer,
        description: case_item.description,
        tagId: case_item.tagId,
        cover: `/static/case_covers/${coverName}`
      })
      for (let item of files) {
        imageTypeFile = item.name.split('.').pop()
        imageName = `${uuidv4()}.${imageTypeFile}`
        await item.mv(path.resolve(__dirname, '..', 'static/case_images', imageName))
        await Case_attachments.create({
          name: imageName,
          caseId: box.id,
        })
        const block = JSON.parse(case_item.blocks).find(block => block.image === item.name);
        if (block) {
          let block_item = await Case_blocks.create({
            text: block.text,
            type_block: block.type,
            caseId: box.id,
            attachment: `/static/case_images/${imageName}`,
            attachment_title: block.attachment_title
          })
          if (block.colors) {
           let color_shem = await Color_shem.create({
              base_color: block.colors.base,
              accent_color: block.colors.focus,
              caseBlockId: block_item.id
            })
            for (let element of block.colors.nuans) {
              await Nuance_color.create({
                color: element,
                colorShemId: color_shem.id
              })
            }
          }
        }
      }
      return res.json(case_item)
    } catch (e) {
      console.log(e)
      return res.status(500).json({error: e.message})
    }
  }

  async deleteCase(req, res) {
    try {
      const {id} = req.params
      const case_item = await Case.findOne({where: {id}})
      if (case_item) {
        const coverFileName = path.basename(case_item.cover);
        const folderPath = path.join(__dirname, '..', 'static/case_covers');
        const filePath = path.join(folderPath, coverFileName);
        await fs.promises.unlink(filePath);
      }
      const files = await Case_attachments.findAll({where: {caseId: id}})
      for (let item of files) {
        try {
          const folderPath = path.join(__dirname, '..', 'static/case_images');
          const filePath = path.join(folderPath, item.name);
          await fs.promises.unlink(filePath);
        } catch (e) {
          console.log(e.message)
        }
      }
      await Case_blocks.destroy({where: {caseId: id}})
      await Case_attachments.destroy({where: {caseId: id}})
      await Case.destroy({where: {id}})
      return res.json(case_item)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getCases(req, res) {
    try {
      const cases = await Case.findAll({
        attributes: ['id', 'name', 'cover']
      })
      return res.json(cases)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getCase(req, res) {
    try {
      const {id} = req.params
      const case_item = await Case.findOne({
        where: {id},
        include: [
          {model: Case_blocks},
          {model: Tag, attributes: ['name']}
        ]
      })
      return res.json(case_item)
    } catch (e) {
      return res.json({error: e.message})
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

  async updateService(req, res) {
    try {
      const updatedService = req.body
      for (let item of updatedService) {
        await Service.update(
          {name: item.name, price: item.price},
          {where: {id: item.id}}
        )
      }
      return res.json(updatedService)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

}

module.exports = new PostController()
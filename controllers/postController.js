const {
  Service,
  Post,
  Post_attachments,
  Post_category,
  Case,
  Case_attachments, Comment,
  Case_blocks, Tag, Color_shem, Nuance_color, Functional, Lead, Lead_content, Service_post, Faq
} = require("../models/models");
const {v4: uuidv4} = require('uuid');
const path = require('path')
const fs = require("fs");
const {Sequelize, Op} = require("sequelize");
const {validationResult} = require("express-validator")
const moment = require("moment");
require('moment/locale/ru');

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
          if (imagesTypeFile !== 'jpeg' && imagesTypeFile !== 'png' && imagesTypeFile !== 'jpg' && imagesTypeFile !== 'gif') {
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
        attributes: ['id', 'title', 'description', 'views', 'cover', 'tagId', 'createdAt'],
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
      const new_posts = await Post.findAll({
        where: {
          id: {
            [Op.not]: id
          },
        },
        order: [['createdAt', 'DESC']],
        limit: 3,
        attributes: ["id", "title", "cover"]
      })
      const like_posts = await Post.findAll({
        where: {
          id: {
            [Op.not]: id
          },
          tagId: post.tagId
        },
        limit: 3,
        attributes: ["id", "title", "cover"]
      })
      post.dataValues.new_posts = new_posts
      post.dataValues.like_posts = like_posts
      return res.json(post)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getByTagPosts(req, res) {
    try {
      const {tagId} = req.query
      const posts = await Post.findAll({
        where: {tagId}
      })
      return res.json(posts)
    } catch (e) {
      return res.json({error: e.message})
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
    try {
      const case_item = req.body
      const files = req.files.files //вложения блоков
      const cover = req.files.cover // обложка портфолио
      const mobile_version = req.files.mobile_version
      const desktop_version = req.files.desktop_version

      let coverName, coverTypeFile
      let imageName, imageTypeFile
      let mobileName, mobileTypeFile
      let desktopName, desktopTypeFile

      if (cover) {
        coverTypeFile = cover.name.split('.').pop() //берем расширение файла
        coverName = `${uuidv4()}.${coverTypeFile}`; // устанавливаем новое уникальное имя
        await cover.mv(path.resolve(__dirname, '..', 'static/case_covers', coverName)); // записываем файл на сервер
      }
      if (mobile_version && desktop_version) {
        mobileTypeFile = mobile_version.name.split('.').pop()
        mobileName = `${uuidv4()}.${mobileTypeFile}`
        await mobile_version.mv(path.resolve(__dirname, '..', 'static/case_images', mobileName))
      }
      if (mobile_version && desktop_version) {
        desktopTypeFile = desktop_version.name.split('.').pop()
        desktopName = `${uuidv4()}.${desktopTypeFile}`
        await desktop_version.mv(path.resolve(__dirname, '..', 'static/case_images', desktopName))
      }
      //Создаем элемент портфолио
      let box = await Case.create({
        name: case_item.name,
        customer: case_item.customer,
        description: case_item.description,
        tagId: case_item.tagId,
        cover: `/static/case_covers/${coverName}` //генерируем ссылку на обожку
      })
      //перебираем вложения
      for (let item of files) {
        //сохранение файла
        imageTypeFile = item.name.split('.').pop()
        imageName = `${uuidv4()}.${imageTypeFile}`
        await item.mv(path.resolve(__dirname, '..', 'static/case_images', imageName))
        //запись файла в бд
        await Case_attachments.create({
          name: imageName,
          caseId: box.id,
        })
        //находим блок с конкретной фотографией
        const block = JSON.parse(case_item.blocks).find(block => block.image === item.name);

        if (block) {
          //создаем блок
          let block_item = await Case_blocks.create({
            text: block.text,
            type_block: block.type,
            description: block.description,
            caseId: box.id,
            attachment: `/static/case_images/${imageName}`, //генерируем ссылку на вложение
            attachment_title: block.attachment_title
          })
          //если есть блок с цветовой схемой
          if (block.colors) {
            //записываем базовые и акцентные цвета
            let color_shem = await Color_shem.create({
              base_color: block.colors.base,
              accent_color: block.colors.focus,
              caseBlockId: block_item.id
            })
            //записываем нюанс цвета
            for (let element of block.colors.nuans) {
              await Nuance_color.create({
                color: element,
                colorShemId: color_shem.id
              })
            }
          }
        }

      }
      const result = JSON.parse(case_item.blocks).find(block => block.image === null)
      if (result) {
        let block_item = await Case_blocks.create({
          text: result.text,
          type_block: result.type,
          caseId: box.id,
          attachment: null, //генерируем ссылку на вложение
          attachment_title: result.attachment_title,
          mobile_version: `/static/case_images/${mobileName}`,
          desktop_version: `/static/case_images/${desktopName}`,
        })
      }
      return res.json(case_item)
    } catch (e) {
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
        include: [{
          model: Case_blocks,
          include: [{
            model: Color_shem,
            attributes: ['id', 'base_color', 'accent_color'],
            include: [{
              model: Nuance_color,
              attributes: ['id', 'color']
            }]
          }]
        },
          {model: Tag, attributes: ['name']},
        ]
      })
      const cases = await Case.findAll({
        where: {
          id: {
            [Op.not]: id
          }
        },
        limit: 3
      })
      case_item.dataValues.cases = cases
      return res.json(case_item)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async createService(req, res) {
    try {
      const {name, price, functions} = req.body
      const examples = req.files?.examples
      const cover = req.files?.cover
      let service
      if (!cover) return res.json("Добавьте изображение услуги")
      // if (!examples) return res.json("Добавьте изображение примеров")
      if (cover) {
        let typeImage = cover.name.split('.').pop()
        let imageName = `${uuidv4()}.${typeImage}`
        await cover.mv(path.resolve(__dirname, '..', 'static/service_images', imageName));
        service = await Service.create({name, price, image_url: `/static/service_images/${imageName}`})
      }
      if (examples) {
        for (let item of examples) {
          let typeImage = item.name.split('.').pop()
          let imageName = `${uuidv4()}.${typeImage}`
          await item.mv(path.resolve(__dirname, '..', 'static/service_images', imageName))
          let img = JSON.parse(functions).find((element) => element.image === item.name)
          await Functional.create({
            name: img.name,
            price: img.price,
            days: img.days,
            description: img.description,
            image: `/static/service_images/${imageName}`,
            checked: img.checked,
            serviceId: service.id
          })
        }
      }
      return res.json('все')
    } catch (e) {
      console.log(e)
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

  async getServices(req, res) {
    try {
      const services = await Service.findAll({
        where: {
          active: true
        },
        attributes: ['id', 'name', 'price', 'image_url']
      })
      return res.json(services)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getService(req, res) {
    try {
      const {id} = req.params
      const service = await Service.findOne({
        where: {id},
        include: [{model: Functional}]
      })
      const service_post = await Service_post.findAll({where: {serviceId: id}})
      let postsIds = service_post.map(item => item.postId)
      const posts = await Post.findAll({
        where: {
          id: {[Op.in]: postsIds}
        },
        attributes: ['id', 'title', 'cover', 'description', 'createdAt']
      })
      const cases = await Case.findAll({
        limit: 5,
        attributes: ['id', 'name', 'cover']
      })
      service.dataValues.posts = posts
      service.dataValues.cases = cases
      return res.json(service)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async createFunction(req, res) {
    try {
      const {name, price, days, description, file, checked, serviceId} = req.body
      const function_item = await Functional.create({name, price, days, description, file, checked, serviceId})
      return res.json(function_item)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async getFunctions(req, res) {
    try {
      const {serviceId} = req.params
      const functions = await Functional.findAll({where: {serviceId}})
      return res.json(functions)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async createLead(req, res) {
    try {
      const {name, contact, functions} = req.body
      let functions_names, lead_content_data
      if (!name || !contact) return res.json("Нету имени или контактных данных")
      const lead = await Lead.create({name, contact})
      if (functions) {
        // Получаем массив объектов, содержащих id и name из таблицы Functional
        const functionsData = await Functional.findAll({
          where: {id: {[Op.in]: functions}},
          attributes: ['id', 'name'] // Нам нужно как id, так и name для сопоставления
        });

        // Преобразуем данные в объект для быстрого поиска по id
        const functionsMap = functionsData.reduce((acc, func) => {
          acc[func.id] = func.name; // Пример: {1: 'name1', 2: 'name2'}
          return acc;
        }, {});

        // Создаем массив объектов для вставки в Lead_content
        const lead_content_data = functions.map(id => ({
          leadId: lead.id,
          functionalId: id,
          functional_name: functionsMap[id] // Подставляем имя функции по id
        }));

        // Массовое создание записей
        await Lead_content.bulkCreate(lead_content_data);
      }

      return res.json({lead, lead_content_data})
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async createTag(req, res) {
    try {
      const {tagName} = req.body
      const tag = await Tag.create({
        name: tagName
      })
      return res.json(tag)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async getTags(req, res) {
    try {
      const tags = await Tag.findAll()
      return res.json(tags)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async deleteTag(req, res) {
    try {
      const {id} = req.params
      const tag = await Tag.destroy({where: {id}})
      return res.json('все')
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async createComment(req, res) {
    try {
      const {username, text, parentCommentId, postId} = req.body
      if (!username) return res.json("Укажите имя")
      if (!text) return res.json("Введите текст")
      if (!postId) return res.json("ошибка, postId не привязан")
      const comment = await Comment.create({
        username, text, parentCommentId, postId
      })
      return res.json(comment)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async getComments(req, res) {
    try {
      const {id} = req.params
      const comments = await Comment.findAll({
        where: {postId: id},
        attributes: ['id', 'username', 'createdAt', 'text', 'parentCommentId']
      })

      const commentMap = new Map();
      // Создаем карту комментариев по их ID
      comments.forEach(comment => {
        commentMap.set(comment.id, {
          ...comment.dataValues,

          createdAt: moment(comment.createdAt).fromNow(),
          replies: []
        });
      });

      const result = [];
      // Построение дерева комментариев
      commentMap.forEach(comment => {
        if (comment.parentCommentId === null) {
          // Если у комментария нет родителя, добавляем его в корень
          result.push(comment);
        } else {
          // Если есть родитель, добавляем текущий комментарий в его дочерние
          const parent = commentMap.get(comment.parentCommentId);
          if (parent) {
            parent.replies.push(comment);
          }
        }
      });
      return res.json(result)
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }

  async createFaqElement(req, res) {
    try {
      const {header, content} = req.body
      const faq = await Faq.create({header, content})
      return res.json(faq)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

  async getFaq(req, res) {
    try {
      const faq = await Faq.findAll({
        attributes: ['id', 'header', 'content']
      })
      return res.json(faq)
    } catch (e) {
      return res.json({error: e.message})
    }
  }

}

module.exports = new PostController()
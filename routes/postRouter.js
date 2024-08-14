const Router = require('express')
const router = new Router()
const postController = require('../controllers/postController')

router.post('/createPost', postController.createPost)

module.exports = router
const Router = require('express')
const router = new Router()
const postController = require('../controllers/postController')

router.post('/createPost', postController.createPost)
router.post('/createService', postController.createService)
router.get('/getAllPosts', postController.getAllPosts)
router.get('/getPost/:id', postController.getPost)

router.post('/createCase', postController.createCase)

module.exports = router
const Router = require('express')
const router = new Router()
const postController = require('../controllers/postController')

router.post('/createPost', postController.createPost)

router.get('/getAllPosts', postController.getAllPosts)
router.get('/getPost/:id', postController.getPost)
router.delete('/deletePost', postController.deletePost)

router.post('/createCase', postController.createCase)
router.delete('/deleteCase', postController.deleteCase)

router.post('/createService', postController.createService)
router.put('/updateService', postController.updateService)

module.exports = router
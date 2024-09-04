const Router = require('express')
const router = new Router()
const postController = require('../controllers/postController')

router.post('/createPost', postController.createPost)
router.get('/getAllPosts', postController.getAllPosts)
router.get('/getPost/:id', postController.getPost)
router.get('/getByTagPosts', postController.getByTagPosts)
router.delete('/deletePost/:id', postController.deletePost)

router.post('/createCase', postController.createCase)
router.delete('/deleteCase/:id', postController.deleteCase)
router.get('/getCases', postController.getCases)
router.get('/getCase/:id', postController.getCase)

router.post('/createService', postController.createService)
router.put('/updateService', postController.updateService)
router.get('/getServices', postController.getServices)

router.post('/createTag', postController.createTag)
router.get('/getTags', postController.getTags)
router.delete('/deleteTag/:id', postController.deleteTag)

router.post('/createComment', postController.createComment)
router.get('/getComments/:id', postController.getComments)

module.exports = router
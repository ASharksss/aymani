
class PostController {
  async createPost(req, res) {
    try {
      return res.json('Привет')
    } catch (e) {
      return res.status(500).json({error: e.message})
    }
  }
}

module.exports = new PostController()
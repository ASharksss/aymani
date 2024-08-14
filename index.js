require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT
const sequelize = require("./db");
require('./models/models')
const router = require("./routes");

app.use('/static', express.static('static'))
app.use(express.json())
app.use('/api', router)

const start = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync().then(result => {
      console.log(result)
    }).catch(e => console.log(e.message))
    app.listen(port, () => console.log('Port started'))
  } catch (e) {
    console.log(e.message)
  }
}

start()
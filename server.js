const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000

// / ==> res = OK
app.get('/', (req, res) => {
  res.send('<h1>Holy Shiiiiiiiiiiiit</h1>')
})

// TODO: /signin ==> POST = success/fail
// TODO: /register ==> POST = new user
// TODO: /profile/:userId ==> GET = user
// TODO: /imgage ==> PUT --> user

app.listen(port, () => {
  console.log(`Server is up at ${port}.`)
})

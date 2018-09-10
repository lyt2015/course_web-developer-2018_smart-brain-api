const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'smart-brain-admin',
    password: '78952',
    database: 'smart-brain-db',
  },
})

const register = require('./controllers/register')
const signin = require('./controllers/signin')
const profile = require('./controllers/profile')
const image = require('./controllers/image')

const salt = bcrypt.genSaltSync(10)
const PORT = process.env.PORT || 3000
const app = express()
app.use(bodyParser.json())
app.use(cors())

app.get('/', async (req, res) => {
  // const users = await knex.select().from('users')
  // const logins = await knex.select().from('logins')
  // const db = { users, logins }
  // res.json(db)
  res.send('Server is running.')
})

app.post('/signin', signin.handleSignin(bcrypt, knex))

app.post('/register', register.handleRegister(bcrypt, salt, knex))

app.get('/profile/:userId', profile.handleProfile(knex))

app.patch('/image', image.handleImage(knex))
app.post('/imageurl', image.handleApiCall)

app.listen(PORT, () => {
  console.log(`Server is up at ${PORT}.`)
})

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

const salt = bcrypt.genSaltSync(10)
console.log('salt:', salt)

const port = 3000
const app = express()
app.use(bodyParser.json())
app.use(cors())

const prettyJSON = obj => {
  return JSON.stringify(obj, null, 2)
}

// / ==> res = OK
app.get('/', async (req, res) => {
  const users = await knex.select().from('users')
  const logins = await knex.select().from('logins')

  const db = { users, logins }

  res.json(db)
})

// /signin ==> POST = success/fail
app.post('/signin', async (req, res) => {
  const { email, password } = req.body

  if (email && password) {
    try {
      const login = (await knex
        .from('logins')
        .where({ email })
        .select('email', 'hash'))[0]

      // console.log(login)

      if (login) {
        bcrypt.compare(password, login.hash, async (err, result) => {
          if (err) {
            console.log(err)
            return res.status(500).json('something went wrong')
          }

          if (result === true) {
            // console.log('correct password')
            const user = (await knex
              .from('users')
              .where({ email })
              .select('*'))[0]
            // console.log(user)
            res.json(user)
          } else {
            // console.log('wrong pasword')
            res.status(400).json('Please check login information again.')
          }
        })
      } else {
        return res.status(400).json('Please check login information again.')
      }
    } catch (error) {
      console.log(error)
      return res.status(400).json('Please check login information again.')
    }
  } else {
    res.status(400).json('Please fill in both email and password.')
  }
})

// /register ==> POST = new user
app.post('/register', (req, res) => {
  const { email, password, name } = req.body
  if (email && password && name) {
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) {
        console.log(err)
        return res.status(400).json('something went wrong')
      }

      if (hash) {
        const newUser = { name, email, joined: new Date() }
        const newLogin = { email, hash }

        knex
          .transaction(trx => {
            return trx
              .insert(newLogin)
              .into('logins')
              .then(() => {
                return trx
                  .insert(newUser)
                  .into('users')
                  .returning('*')
              })
          })
          .then(insertedUsers => {
            // console.log('insertedUsers:', insertedUsers)

            return res.json(insertedUsers[0])
          })
          .catch(err => {
            return res.status(400).json('Please try register with other name or email again.')
          })
      }
    })
  } else {
    res.status(400).json('Please register with name, email and password.')
  }
})

// /profile/:userId ==> GET = user
app.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const user = (await knex('users')
      .select('*')
      .where({ _id: userId }))[0]

    if (user) {
      res.json(user)
    } else {
      res.status(400).send('no user found')
    }
  } catch (error) {
    res.status(500).json('retrieving data failed')
  }
})

// /imgage ==> PATCH --> user
app.patch('/image', async (req, res) => {
  const { _id } = req.body

  try {
    const user = (await knex('users')
      .where({ _id })
      .increment('entries', 1)
      .returning('*'))[0]

    if (user) {
      return res.json(user)
    } else {
      return res.status(400).json('failed updating user')
    }
  } catch (error) {
    res.status(500).json('retrieving data failed')
  }
})

app.listen(port, () => {
  console.log(`Server is up at ${port}.`)
})

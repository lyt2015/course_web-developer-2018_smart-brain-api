const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')

const salt = bcrypt.genSaltSync(10)
console.log('salt:', salt)

const port = 3000
const app = express()
app.use(bodyParser.json())

const database = {
  users: [
    {
      _id: '001',
      name: 'Lisa',
      email: 'lisa@gmail.com',
      password: '123456',
      entries: 0,
      joined: new Date(),
    },
    {
      _id: '002',
      name: 'Mary',
      email: 'mary@gmail.com',
      password: '654321',
      entries: 0,
      joined: new Date(),
    },
  ],

  logins: [
    {
      _id: '001',
      email: 'lisa@gmail.com',
      hash: '',
    },
  ],
}

const prettyJSON = obj => {
  return JSON.stringify(obj, null, 2)
}

// / ==> res = OK
app.get('/', (req, res) => {
  // res.send('<h1>Holy Shiiiiiiiiiiiit</h1>')
  res.json(database.users)
})

// /signin ==> POST = success/fail
app.post('/signin', (req, res) => {
  const { email, password } = req.body
  let userId = null
  let hash = null
  let foundUser = null
  database.logins.some((login, index) => {
    if (email === login.email) {
      userId = login._id
      hash = login.hash
      return true
    }
  })

  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.log(err)
      throw err
    }

    if (result) {
      database.users.some(user => {
        if (userId === user._id) {
          res.send(user)
        }
      })
    }else{
      res.send('User not found.')
    }
  })
})

// /register ==> POST = new user
app.post('/register', (req, res) => {
  const { email, password, name } = req.body
  if (email && password && name) {
    const _id = (database.users.length + 1).toString().padStart(3, '0')

    let newLogin = null
    let newUser = null
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) {
        console.log(err)
        res.send('Sorry, there are some problems.')
      }

      if (hash) {
        console.log('hash:', hash)
      }
      newLogin = {
        _id,
        email,
        hash,
      }
      database.logins.push(newLogin)

      newUser = {
        _id,
        email,
        name,
        entries: 0,
        joined: new Date(),
      }
      database.users.push(newUser)

      // res.setHeader('Content-Type', 'application/json')
      // res.writeHead(200)
      res.write('You are now a registered user\n')
      res.write(prettyJSON(newUser))
      res.write(prettyJSON(newLogin))
      return res.end()
    })
  }
})

// /profile/:userId ==> GET = user
app.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId
  let foundUser = null
  database.users.some(user => {
    if (userId === user._id) {
      return (foundUser = user)
    }
  })

  if (foundUser) {
    res.json(foundUser)
  } else {
    res.status(404).send('No user found.')
  }
})

// /imgage ==> PATCH --> user
app.patch('/image', (req, res) => {
  const { _id } = req.body
  let foundUser = null
  database.users.some(user => {
    if (_id === user._id) {
      user.entries += 1
      return (foundUser = user)
    }
  })

  if (foundUser) {
    res.json(foundUser)
  } else {
    res.status(404).send('No user found.')
  }
})

app.listen(port, () => {
  console.log(`Server is up at ${port}.`)
})

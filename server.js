const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt-nodejs')
const cors = require('cors')

const salt = bcrypt.genSaltSync(10)
console.log('salt:', salt)

const port = 8080
const app = express()
app.use(bodyParser.json())
app.use(cors())

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
      password: '123456',
      entries: 0,
      joined: new Date(),
    },
    {
      _id: '003',
      name: 'aaa',
      email: 'a@a',
      password: 'aaaaaaaaa',
      entries: 0,
      joined: new Date(),
    },
  ],

  logins: [
    // {
    //   _id: '001',
    //   email: 'lisa@gmail.com',
    //   hash: '',
    // },
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
  let foundUser = null
  database.users.some(user => {
    if (email === user.email) {
      if (password === user.password) {
        foundUser = user
        return true
      }
    }
  })

  if (foundUser) {
    console.log('user found')
    res.status(200).json(foundUser)
  } else {
    console.log('user not found')
    res.status(400).json('fail')
  }
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
        res.status(400).json('fail')
        // res.send('Sorry, there are some problems.')
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
      console.log(newLogin)

      newUser = {
        _id,
        email,
        name,
        entries: 0,
        joined: new Date(),
      }
      database.users.push(newUser)
      console.log(newUser)

      // res.setHeader('Content-Type', 'application/json')
      // res.writeHead(200)
      // res.write('You are now a registered user\n')
      // res.write(prettyJSON(newUser))
      // res.write(prettyJSON(newLogin))
      // return res.end()
      res.status(200).json(newUser)
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
    res.json({
      _id: foundUser._id,
      entries: foundUser.entries,
      name: foundUser.name,
    })
  } else {
    res.status(404).send('No user found.')
  }
})

app.listen(port, () => {
  console.log(`Server is up at ${port}.`)
})

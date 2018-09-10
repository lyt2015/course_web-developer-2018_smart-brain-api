const handleRegister = (bcrypt, salt, knex) => (req, res) => {
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
}

module.exports = {
  handleRegister,
}

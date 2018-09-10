const handleSignin = (bcrypt, knex) => async (req, res) => {
  const { email, password } = req.body
  if (email && password) {
    try {
      const login = (await knex
        .from('logins')
        .where({ email })
        .select('email', 'hash'))[0]

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
}

module.exports = {
  handleSignin,
}

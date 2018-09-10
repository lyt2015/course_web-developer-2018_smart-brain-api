const handleProfile = knex => async (req, res) => {
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
}

module.exports = {
  handleProfile,
}

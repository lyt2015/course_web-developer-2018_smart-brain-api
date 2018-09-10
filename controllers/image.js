const handleImage = knex => async (req, res) => {
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
}

module.exports = {
  handleImage,
}

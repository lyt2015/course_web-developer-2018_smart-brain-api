const Clarifai = require('clarifai')

const app = new Clarifai.App({ apiKey: 'c330aeac794f40db9cb1ec09356e3171' })

const handleApiCall = async (req, res) => {
  try {
    const result = await app.models.predict(Clarifai.DEMOGRAPHICS_MODEL, req.body.imageUrl)
    res.json(result)
  } catch (error) {
    console.log(error)
    res.status(400).json('requesting clarifai image detection service failed')
  }
}

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
  handleApiCall,
  handleImage,
}

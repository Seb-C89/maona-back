const imagesRouter = require('express').Router();
const Joi = require('joi');

const {
  findAllImages,
} = require('../models/imagesModel');

imagesRouter.get('/', async (req, res) => {
  try {
    const [result] = await findAllImages(req.query);

    if (!result.length) {
      return res.status(404).json({ message: 'No testimonilas found' });
    }
    return res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: `An error occurred: ${err.message}` });
  }
});

module.exports = imagesRouter;
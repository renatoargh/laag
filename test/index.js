const lambida = require('lambida')

module.exports.handler = lambida({
  'GET /': (req, res) => {
    return res.json(200, req)
  },

  'GET /cars/{carId}': (req, res) => {
    return res.json(200, req)
  },

  'POST /sbrubbles/{opa}': (req, res) => {
    return res.json(200, req)
  },

  'GET /cars/{carId}/sbrubbles/{sbrubblesId}': (req, res) => {
    return res.json(200, req)
  }
})

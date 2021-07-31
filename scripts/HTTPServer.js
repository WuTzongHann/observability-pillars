const express = require('express')

module.exports = {
  startServer: function () {
    const app = express()
    const port = 8080
    app.use(express.json())

    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    app.get('/health', (req, res) => {
      const response = {
        status: 'ok'
      }
      res.json(response)
    })

    app.post('/echo', (req, res) => {
      const response = req.body
      const time = new Date()
      response.timestr = time
      response.timestamp = time.getTime()
      res.status(200).json(response)
    })

    app.listen(port, () => {
      console.log(`HTTP Server listening at http://localhost:${port}`)
    })
  }
}

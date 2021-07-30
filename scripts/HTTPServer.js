'use strict';

module.exports = {
  startServer: function () {
    let express = require('express');
    let app = express();
    let port = 8080;
    app.use(express.json());

    app.get('/', (req, res) => {
      res.send('Hello World!');
    })

    app.get('/health', (req, res) => {
      let response = {
        status: "ok"
      };
      res.status(200).json(response);
    })

    app.post('/echo', (req, res) => {
      let response = req.body;
      let time = new Date;
      response["timestr"] = time;
      response["timestamp"] = time.getTime();
      res.status(200).json(response);
    })

    app.listen(port, () => {
      console.log(`HTTP Server listening at http://localhost:${port}`);
    })
  }
}
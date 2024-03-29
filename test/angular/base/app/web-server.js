const express = require('express')
const compression = require('compression')
const path = require('path')
const serveIndex = require('serve-index')

const app = express()

app.set('port', 4200)

app.use(compression())
app.use(express.static(path.join(__dirname, 'dist')))
app.use(serveIndex(path.join(__dirname, 'dist')))

const server = app.listen(app.get('port'), () => {
  console.log('The server is running on http://localhost:' + app.get('port'))
})

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0)
  })
})

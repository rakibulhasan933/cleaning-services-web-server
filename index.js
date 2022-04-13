const express = require('express')
const app = express()
const port = 5000

app.get('/', (req, res) => {
    res.send('Cleaning Services API Working!')
})

app.listen(port, () => {
    console.log(`Cleaning Port listening on port ${port}`)
})
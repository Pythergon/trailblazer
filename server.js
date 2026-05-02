const express = require('express');
const app = express();

const port = 3000
const ip_addr = '10.0.0.32'

app.use(express.json());

app.patch('/', (req, res) => {
    console.log(req.body);
    res.status(200).send('Data receieved: ')
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on: http://${ip_addr}:${port}`)
});
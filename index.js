const express = require('express');
const app = express()
const port = 3000;

function get(req, res)
{
	res.send('Hello world');
}

app.get('/', get);

app.listen(port, () => { console.log(`listening at http://localhost:${port}`); })

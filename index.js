const express = require('express');
const { MongoClient } = require('mongodb');

const app = express()
const port = 3000;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(
	uri, 
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
);

async function findTasks(aDatabase, aPage = 1, aLimit = 10)
{
	let tasks = [];

	try {
		const db = client.db(aDatabase);
		const taskCollection = db.collection('task');
		const cursor = taskCollection
			.find()
			.skip(aPage > 0 ? ((aPage - 1) * aLimit) : 0)
			.limit(aLimit);

		tasks = await cursor.toArray();
		return [];
	}
	catch (excp) {
		console.log('>>>>>>>>>>>>>>>>>>');
		console.error(excp)
		console.log('<<<<<<<<<<<<<<<<<<');

		tasks = [];
	}
	finally {
		return tasks;
	}
}

app.get('/', async (aReq, aRes) => {
	aRes.send('Hello world');
});

app.get('/api/tasks', async (aReq, aRes) => {
	const { db, limit, page } = aReq.query;
	const tasks = await findTasks(db, page, limit);
	
	aRes.json(tasks);
});

/**
 * https://stackoverflow.com/a/18311469
 */
app.use((aReq, aRes, aNext) => {
	aRes.setHeader('Access-Control-Allow-Origin', '*');
	aRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	aRes.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	aRes.setHeader('Access-Control-Allow-Credentials', true);

	aNext();
});

app.listen(port, async () => { 
	console.log(`listening at http://localhost:${port}`); 
	await client.connect();
})

app.on('exit', async () => { await client.close(); })

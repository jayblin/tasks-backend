const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express()
const port = 3000;

app.use(cors());

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

async function fetchStatuses(aDatabase)
{
	let statuses = [];

	try {
		const db = client.db(aDatabase);
		const taskCollection = db.collection('task_status');
		const cursor = taskCollection.aggregate([
			{
				'$unset': ['_id']
			}
		]);

		statuses = await cursor.toArray();
		return [];
	}
	catch (excp) {
		console.log('>>>>>>>>>>>>>>>>>>');
		console.error(excp)
		console.log('<<<<<<<<<<<<<<<<<<');

		statuses = [];
	}
	finally {
		return statuses;
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

app.get('/api/statuses', async (aReq, aRes) => {
	const { db } = aReq.query;
	const statuses = await fetchStatuses(db);

	return aRes.json(statuses);
});

app.listen(port, async () => { 
	console.log(`listening at http://localhost:${port}`); 
	await client.connect();
})

app.on('exit', async () => { await client.close(); })

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express()
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend/dist'));

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
			.aggregate(
				[
				  {
					'$sort': {
						'createdAt': -1
					},
				},
				{
					'$unset': ['_id']
				}
				]
			)
			.skip(aPage > 0 ? ((aPage - 1) * aLimit) : 0)
			.limit(aLimit);

		tasks = await cursor.toArray();
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

// app.get('/', async (aReq, aRes) => {

// 	aRes.send('Hello world');
// });

app.get('/api/tasks', async (aReq, aRes) => {
	const { db, limit, page } = aReq.query;
	const tasks = await findTasks(db, Number(page), Number(limit));
	
	aRes.json({data: tasks});
});

app.patch('/api/tasks', async(aReq, aRes) => {
	const { db } = aReq.query;
	const task = aReq.body;

	if (task.createdAt) {
		task.createdAt = new Date(task.createdAt);
	}

	task.updatedAt = new Date();

	try {
		const mongodb = client.db(db);
		const taskCollection = mongodb.collection('task');
		const filter = {
			id: task.id,
		};
		const updateDocument = {
			$set: {
				...task
			},
		};
		const options = {
			// upsert: true,
		};

		const result = await taskCollection.updateOne(filter, updateDocument, options);

		if (result.modifiedCount > 0) {
			aRes.json({
				notifications: [
					{
						text: "Задача обновлена",
						type: "success"
					},
				],
			});

			return;
		}
		else {
			aRes.json({
				notifications: [
					{
						text: "Задача не обновлена",
						type: "warning"
					},
				],
			});
			return;
		}
	}
	catch (excp) {
	}

	aRes.json(task);
});

app.post('/api/tasks', async (aReq, aRes) => {
	const { db } = aReq.query;
	const task = aReq.body;

	if (task.createdAt) {
		task.createdAt = new Date(task.createdAt);
	}
	else {
		task.createdAt = new Date();
	}

	try {
		const mongodb = client.db(db);
		const taskCollection = mongodb.collection('task');

		let lastTaskInCollection = await taskCollection.find().sort({id: -1}).limit(1).toArray();

		/** @todo: Подумать как более эффективно определять id для новой задачи */
		if (lastTaskInCollection.length === 1)
		{
			lastTaskInCollection = lastTaskInCollection[0];
		}
		else 
		{
			lastTaskInCollection = { id: 0 };
		}

		task.id = lastTaskInCollection.id + 1;
		/**
		 * @todo: Подумать как выставлять статсы.
		*/
		task.status = 0;

		const result = await taskCollection.insertOne(task);

		if (result.insertedCount === 1) {
			aRes.json({
				notifications: [
					{
						text: "Задача создана",
						type: "success"
					},
				],
			});

			return;
		}
		else {
			aRes.json({
				notifications: [
					{
						text: "Задача не создана",
						type: "warning"
					},
				],
			});
			return;
		}
	}
	catch (excp) {
		console.log(excp);
	}

	aRes.json(task);
});

app.delete('/api/tasks', async (aReq, aRes) => {
	const { db, task_id } = aReq.query;

	try {
		const mongodb = client.db(db);
		const taskCollection = mongodb.collection('task');

		const query = {
			id: {
				$eq: Number(task_id),
			}
		};

		const result = await taskCollection.deleteOne(query);

		if (result.deletedCount === 1) {
			aRes.json({
				notifications: [
					{
						text: "Задача удалена",
						type: "success"
					},
				],
			});

			return;
		}
		else {
			aRes.json({
				notifications: [
					{
						text: "Задача не удалена",
						type: "warning"
					},
				],
			});
			return;
		}
	}
	catch (excp) {
		console.log(excp);
	}

	aRes.json([]);
});

function insertDefaultStatuses(aDBName)
{
	const mongodb = client.db(aDBName);
	const statusCollection = mongodb.collection('task_status');

	const defaultStatuses = [
		{
			id: 0,
			title: 'Запланировано',
		},
		{
			id: 1,
			title: 'WIP',
		},
		{
			id: 2,
			title: 'Готово',
		},
	];

	statusCollection.insertMany(defaultStatuses);

	return defaultStatuses;
}

app.get('/api/statuses', async (aReq, aRes) => {
	const { db } = aReq.query;
	let statuses = await fetchStatuses(db);

	if (statuses.length === 0) {
		statuses = insertDefaultStatuses(db);
	}

	return aRes.json({data: statuses});
});

app.listen(port, async () => { 
	console.log(`listening at http://localhost:${port}`); 
	await client.connect();
})

app.on('exit', async () => { await client.close(); })

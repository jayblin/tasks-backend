// const express = require('express');
// const cors = require('cors');
// const { MongoClient } = require('mongodb');
import express from 'express';
import cors from 'cors';
import mongo from '@/service/mongodb';
import boot from '@/service/endpoint-boot';
import Tasks from '@/endpoint/tasks';

const app = express()
const port = 3000;

app.use(cors());
app.use(express.json());
// @todo: env
app.use(express.static('../frontend/dist'));

const client = mongo.Client();

async function fetchStatuses(aDatabase: string)
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

function insertDefaultStatuses(aDBName: string)
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
	const { db } = aReq.query as Record<string, string>;
	let statuses = await fetchStatuses(db);

	if (statuses.length === 0) {
		statuses = insertDefaultStatuses(db);
	}

	return aRes.json({data: statuses});
});

[Tasks].forEach((aCtor) => boot(app, new aCtor()));

app.listen(port, async () => { 
	console.log(`listening at http://localhost:${port}`); 
	await client.connect();
})

app.on('exit', async () => { await client.close(); })

export default app;

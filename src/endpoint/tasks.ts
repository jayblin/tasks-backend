import mongodb from "@/service/mongodb";
import { Request, Response } from "express-serve-static-core/index";
import Endpoint from "@/endpoint/endpoint";

type StatusObject = {
	id: number;
	title: string;
};

type TaskObject = {
	id: StatusObject["id"];
	description: string;
	status: number;
	createdAt: Date;
	linkedTasks?: StatusObject["id"][];
};

class Tasks implements Endpoint
{
	path = '/api/tasks';

	async Get(aReq: Request, aRes: Response)
	{
		const { db, limit, page } = aReq.query as Record<string, string>;
		const tasks = await this.findTasks(
			db,
			Number(page ?? 1),
			Number(limit ?? 10)
		);
		
		aRes.json({data: tasks});
	}

	async Patch(aReq: Request, aRes: Response)
	{
		const { db } = aReq.query as Record<string, string>;
		const task = aReq.body;

		if (task.createdAt) {
			task.createdAt = new Date(task.createdAt);
		}

		task.updatedAt = new Date();

		await mongodb.Execute(async () => {
			const client = mongodb.Client().db(db);
			const taskCollection = client.collection('task');
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

			const result = await taskCollection.updateOne(
				filter,
				updateDocument,
				options
			);

			// @todo: Систематизировать создание нитифаек
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
		});
	}

	async Post(aReq: Request, aRes: Response)
	{
		const { db } = aReq.query as Record<string, string>;
		const task = aReq.body;

		if (task.createdAt) {
			task.createdAt = new Date(task.createdAt);
		}
		else {
			task.createdAt = new Date();
		}

		await mongodb.Execute(async () => {
			const client = mongodb.Client().db(db);
			const taskCollection = client.collection('task');

			let lastTaskInCollection: any = await taskCollection.find().sort({id: -1}).limit(1).toArray();

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
			 * @todo: Подумать как выставлять статусы.
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
			else 
			{
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

		});
	}

	async Delete(aReq: Request, aRes: Response)
	{
		const { db, task_id } = aReq.query as Record<string, string>;

		await mongodb.Execute(async () => {
			const client = mongodb.Client().db(db);
			const taskCollection = client.collection('task');

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
		});
	}

	async Put(aReq: Request, aRes: Response) {}

	private async findTasks(aDatabase: string, aPage: number, aLimit: number)
	{
		return await mongodb.Execute<TaskObject[]>(async () => {
			const db = mongodb.Client().db(aDatabase);
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

			return await cursor.toArray();
		});
	}
}

export default Tasks;

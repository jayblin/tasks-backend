import { MongoClient } from 'mongodb';
import mongo from '@/service/mongodb';

afterAll(async () => {
	const client = mongo.Client();

	if(client.isConnected())
	{
		await client.close();
	}
})

describe('Instance of MongoDB class', () => {

	it('should provide MongoClient', async () => {
		const client = mongo.Client();

		expect(client).toBeInstanceOf(MongoClient);
	}); 

	it('should connect to DB and close connection', async () => {
		const client = mongo.Client();

		await client.connect();
		expect(client.isConnected()).toBe(true);

		await client.close();
		expect(client.isConnected()).toBe(false);
	});

	it('should execute mongo operations', async () => {
		const callback = jest.fn(async () => {});

		await mongo.Execute(callback);

		expect(callback).toBeCalled();
	});

	it('should return value after execution', async () => {
		const callback = jest.fn(
			 async () => ({status: "ok"})
		);

		const result = await mongo.Execute(callback);

		expect(result === null).toBeFalsy();
		expect(result?.status).toBe("ok");
	})
});



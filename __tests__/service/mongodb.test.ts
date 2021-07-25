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
});



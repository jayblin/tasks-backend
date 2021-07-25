import { MongoClient } from 'mongodb';

export class MongoDB
{
	/**
	 * @todo: в env
	 */
	private _port = '27017';
	private _host = 'mongodb://localhost';
	
	private _client: MongoClient | null = null;

	public Client(): MongoClient
	{
		if (!this._client)
		{
			this._client = new MongoClient(
				`${this._host}:${this._port}`,
				{
					useNewUrlParser: true,
					useUnifiedTopology: true,
				}
			);
		}

		return this._client;
	}

	public async Execute<T>(
		aCallback: () => Promise<T> | T
	): Promise<T | null>
	{
		let result: T | null = null;
		try
		{
			result = await aCallback();
		}
		catch (excp)
		{
			console.log('[MongoDB Error]');
			console.log(excp);
		}
		finally
		{
			return result;
		}
	}
}

const inst = new MongoDB();

export default inst;

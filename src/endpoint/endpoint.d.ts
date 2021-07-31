import { Request, Response } from "express-serve-static-core/index";

interface Endpoint
{
	async Get(aRequest: Request, aResponse: Response): void;
	async Post(aRequest: Request, aResponse: Response): void;
	async Patch(aRequest: Request, aResponse: Response): void;
	async Put(aRequest: Request, aResponse: Response): void;
	async Delete(aRequest: Request, aResponse: Response): void;

	path: string;
}

export default Endpoint;

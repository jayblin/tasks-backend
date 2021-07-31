import Endpoint from '@/endpoint/endpoint';
import { Application } from "express-serve-static-core/index";

function boot(aApp: Application, aEndpoint: Endpoint)
{
	aApp.get(aEndpoint.path, aEndpoint.Get.bind(aEndpoint));
	aApp.post(aEndpoint.path, aEndpoint.Post.bind(aEndpoint));
	aApp.patch(aEndpoint.path, aEndpoint.Patch.bind(aEndpoint));
	aApp.put(aEndpoint.path, aEndpoint.Put.bind(aEndpoint));
	aApp.delete(aEndpoint.path, aEndpoint.Delete.bind(aEndpoint));
}

export default boot;

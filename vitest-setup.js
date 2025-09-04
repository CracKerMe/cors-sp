import { fetch, Request, Response, Headers } from "undici";

global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;

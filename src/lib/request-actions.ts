import type { RequestStatus, ServiceRequest } from "./app";
export function requestActions(request: Pick<ServiceRequest,"status"|"customer_id"|"provider_id">, userId: string): RequestStatus[] {
 if(request.provider_id===userId){if(request.status==="pending")return ["accepted","rejected"];if(request.status==="accepted")return ["completed","cancelled"];}
 if(request.customer_id===userId && (request.status==="pending"||request.status==="accepted")) return ["cancelled"];
 return [];
}

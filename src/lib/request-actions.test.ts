import {describe,it,expect} from "vitest";
import {requestActions} from "./request-actions";
describe("request actions",()=>{
 const base={customer_id:"customer",provider_id:"provider"};
 it("providers can accept or reject pending requests",()=>expect(requestActions({...base,status:"pending"},"provider")).toEqual(["accepted","rejected"]));
 it("providers can complete or cancel accepted requests",()=>expect(requestActions({...base,status:"accepted"},"provider")).toEqual(["completed","cancelled"]));
 it("customers can only cancel active requests",()=>{expect(requestActions({...base,status:"pending"},"customer")).toEqual(["cancelled"]);expect(requestActions({...base,status:"accepted"},"customer")).toEqual(["cancelled"]);});
 it("terminal requests have no participant actions",()=>expect(requestActions({...base,status:"completed"},"provider")).toEqual([]));
 it("nonparticipants have no actions",()=>expect(requestActions({...base,status:"pending"},"other")).toEqual([]));
});

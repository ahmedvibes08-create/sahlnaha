import { describe, expect, it } from "vitest";
import { notificationTarget } from "./app";

describe("notification links", () => {
  it("sends message notifications to the chat page", () => {
    expect(notificationTarget("/provider/messages")).toBe("/messages");
  });
  it("sends request notifications to the dashboard", () => {
    expect(notificationTarget("/customer/requests")).toBe("/dashboard");
  });
});

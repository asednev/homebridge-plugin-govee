import { sanitizeDeviceName } from "./utils";

describe("sanitizeDeviceName", () => {
  it("should handle mixed case", () => {
    const original = "Ab3dE";
    const s = sanitizeDeviceName(original);
    expect(s).toEqual(original);
  });

  it("should ignore underscore", () => {
    const s = sanitizeDeviceName("a_b");
    expect(s).toEqual("ab");
  });

  it("should ignore disallowed characters", () => {
    const s = sanitizeDeviceName("abцd");
    expect(s).toEqual("abd");
  });
});

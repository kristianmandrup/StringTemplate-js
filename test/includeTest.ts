/*global describe, it*/

"use strict";

import { loadGroup, makeWriter } from "../lib";
const testTemplateGroup = require("./include_stg");

// xxx todo compile group first

describe("test group include.stg", function() {
  it("should generate the expected string for template main", function() {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("/main");
    expect(t).not.toBeNull();
    t.add("arg1", {
      first: "Max",
      last: "Smith"
    });
    t.write(writer);
    expect(writer.toString()).toEqual("  before [Max], [Smith] after");
  });
});

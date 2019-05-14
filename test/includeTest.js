/*global describe, it*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var testTemplateGroup = require("./include_stg");
// xxx todo compile group first
describe("test group include.stg", function () {
    it("should generate the expected string for template main", function () {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
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

/*global describe, it*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var helloTemplateGroup = require("./hello.st");
describe("hello world test", function () {
    it("should generate the expected string", function () {
        var t, group = lib_1.loadGroup(helloTemplateGroup), writer = lib_1.makeWriter();
        t = group.getTemplate("/hello");
        expect(t).not.toBeNull();
        t.add("audience", "world");
        t.write(writer);
        var expected = "Hello world!" + writer.eol;
        expect(writer.toString()).toEqual(expected);
    });
    it("should generate the expected string with null input", function () {
        var t, group = lib_1.loadGroup(helloTemplateGroup), writer = lib_1.makeWriter();
        t = group.getTemplate("/hello");
        expect(t).not.toBeNull();
        t.add("audience", null);
        t.write(writer);
        var expected = "Hello is anyone there?!" + writer.eol;
        expect(writer.toString()).toEqual(expected);
    });
    it("should generate the expected string with an array", function () {
        var t, group = lib_1.loadGroup(helloTemplateGroup), writer = lib_1.makeWriter();
        t = group.getTemplate("hello");
        expect(t).not.toBeNull();
        t.add("audience", ["Bob", "Sue", "Dan"]);
        t.write(writer);
        var expected = "Hello Bob, Sue, Dan!" + writer.eol;
        expect(writer.toString()).toEqual(expected);
    });
    it("should generate the expected string with a single item array", function () {
        var t, group = lib_1.loadGroup(helloTemplateGroup), writer = lib_1.makeWriter();
        t = group.getTemplate("hello");
        expect(t).not.toBeNull();
        t.add("audience", ["world"]);
        t.write(writer);
        var expected = "Hello world!" + writer.eol;
        expect(writer.toString()).toEqual(expected);
    });
    it("should generate the expected string with an empty array", function () {
        var t, group = lib_1.loadGroup(helloTemplateGroup), writer = lib_1.makeWriter();
        t = group.getTemplate("hello");
        expect(t).not.toBeNull();
        t.add("audience", []);
        t.write(writer);
        var expected = "Hello !" + writer.eol;
        expect(writer.toString()).toEqual(expected);
    });
    it("should generate the expected string when there is renderer", function () {
        var t, rc = { test: "don't care" }, group = lib_1.loadGroup(helloTemplateGroup), writer = lib_1.makeWriter();
        t = group.getTemplate("hello");
        group.registerAttributeRenderer("string", function (value, fmt, context) {
            expect(fmt).toBeNull();
            expect(context).toEqual(rc);
            return value.toUpperCase();
        });
        expect(t).not.toBeNull();
        t.add("audience", "world");
        t.write(writer, rc);
        var expected = "Hello WORLD!" + writer.eol;
        expect(writer.toString()).toEqual(expected);
    });
});

/*global describe, it*/
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var lib_1 = require("../lib");
var testTemplateGroup = require("./testGroup_stg");
var child_process_1 = require("child_process");
function getSTReferenceOutput(group, template, data, callback, options) {
    if (options === void 0) { options = {}; }
    var output = "";
    var errOutput = "";
    var args = (options || []).concat([options || "", group + "." + template]);
    var stst = child_process_1.spawn("stst_java", args, {
        cwd: path_1.default.dirname(options.filename),
        stdio: ["pipe", "pipe", "pipe"]
    });
    stst.stdin.write(JSON.stringify(data));
    stst.stdin.end();
    stst.stdout.on("data", function (data) {
        output += data;
    });
    stst.stderr.on("data", function (data) {
        errOutput += data;
    });
    stst.on("close", function () {
        callback(output, errOutput);
    });
}
describe("test group test", function () {
    it("should generate same output as reference implementation for template testEscapes", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testEscapes", {}, function (refOutput) {
            t = group.getTemplate("/testEscapes");
            expect(t).not.toBeNull();
            // there are no arguments
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testLiterals", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testLiterals", {}, function (refOutput) {
            t = group.getTemplate("/testLiterals");
            expect(t).not.toBeNull();
            // there are no arguments
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testDictionaryAccess", function (done) {
        var t;
        var group = lib_1.loadGroup(testTemplateGroup);
        var writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testDictionaryAccess", { a: "value of a" }, function (refOutput) {
            t = group.getTemplate("/testDictionaryAccess");
            expect(t).not.toBeNull();
            t.setArgs({ a: "value of a" });
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testDictionaryAccessAlt", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testDictionaryAccessAlt", { a: "one" }, function (refOutput) {
            t = group.getTemplate("/testDictionaryAccessAlt");
            expect(t).not.toBeNull();
            t.setArgs({ a: "one" });
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            writer = lib_1.makeWriter();
            getSTReferenceOutput("testGroup", "testDictionaryAccessAlt", { a: "two" }, function (refOutput) {
                t = group.getTemplate("/testDictionaryAccessAlt");
                expect(t).not.toBeNull();
                t.setArgs({ a: "two" });
                t.write(writer);
                expect(writer.toString()).toBe(refOutput);
                done();
            });
        });
    });
    it("should generate same output as reference implementation for template simple", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "simple", {
            arg1: {
                hasTitle: true,
                title: "Mr",
                first: "Sam",
                last: "Smith"
            }
        }, function (refOutput) {
            t = group.getTemplate("/simple");
            expect(t).not.toBeNull();
            t.setArgs({
                arg1: {
                    hasTitle: true,
                    title: "Mr",
                    first: "Sam",
                    last: "Smith"
                }
            });
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            writer = lib_1.makeWriter();
            getSTReferenceOutput("testGroup", "simple", {
                arg1: {
                    hasTitle: false,
                    first: "Sam",
                    last: "Smith"
                }
            }, function (refOutput) {
                t = group.getTemplate("/simple");
                expect(t).not.toBeNull();
                t.setArgs({
                    arg1: {
                        hasTitle: false,
                        first: "Sam",
                        last: "Smith"
                    }
                });
                t.write(writer);
                expect(writer.toString()).toBe(refOutput);
                done();
            });
        });
    });
    it("should generate same output as reference implementation for template testArgsCaller with no args passed in", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testArgsCaller", {}, function (refOutput, errors) {
            t = group.getTemplate("/testArgsCaller");
            expect(t).not.toBeNull();
            // there are no arguments
            console.log("xxx errors: " + errors);
            t.write(writer);
            expect(writer.toString()).toBe(refOutput); // xxx need to verify runtime errors and results separately
            // xxx pass throught not yet hooked up
            // xxx seems to be a difference with extra new line
            done();
        });
    });
    it("should generate same output as reference implementation for template testMap", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter({ lineWidth: 20 });
        getSTReferenceOutput("testGroup", "testMap", { list: ["apple", "banana", null, "orange"] }, function (refOutput, errors) {
            t = group.getTemplate("/testMap");
            expect(t).not.toBeNull();
            // there are no arguments
            console.log("xxx errors: " + errors);
            t.setArgs([["apple", "banana", null, "orange"]]);
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        }, ["-w", "20"]);
    });
    it("should generate same output as reference implementation for template testMapRot", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testMapRot", { board: ["x", " ", "X", "O", "O", "X", " ", " ", " "] }, function (refOutput, errors) {
            t = group.getTemplate("/testMapRot");
            expect(t).not.toBeNull();
            // there are no arguments
            t.setArgs({ board: ["x", " ", "X", "O", "O", "X", " ", " ", " "] });
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testPropIndirect", function (done) {
        var t, attrs = {
            names: [
                { last: "Smith", first: "Max" },
                { last: "Jones", first: "Sam" }
            ],
            propName: "last"
        }, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testPropIndirect", attrs, function (refOutput, errors) {
            t = group.getTemplate("/testPropIndirect");
            expect(t).not.toBeNull();
            // there are no arguments
            t.setArgs(attrs);
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testIncludeIndirect", function (done) {
        var t, attrs = {}, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testIncludeIndirect", attrs, function (refOutput, errors) {
            t = group.getTemplate("testIncludeIndirect");
            expect(t).not.toBeNull();
            // there are no arguments
            t.setArgs(attrs);
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testNestedPropRef", function (done) {
        var t, attrs = {
            deep: { level1: { things: { stuff: "gold", junk: "lemon" } } }
        }, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testNestedPropRef", attrs, function (refOutput, errors) {
            t = group.getTemplate("/testNestedPropRef");
            expect(t).not.toBeNull();
            // there are no arguments
            t.setArgs(attrs);
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testEmptyTemplates", function (done) {
        var t, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testEmptyTemplates", {}, function (refOutput, errors) {
            t = group.getTemplate("/testEmptyTemplates");
            expect(t).not.toBeNull();
            // there are no arguments
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
    it("should generate same output as reference implementation for template testZipMap", function (done) {
        var t, data = {
            zipC1: ["obj1", "thing", "obj2", "obj2"],
            zipC2: ["p1", "wrench", "x", "p2"],
            zipC3: ["apple", "10092", "foo"]
        }, group = lib_1.loadGroup(testTemplateGroup), writer = lib_1.makeWriter();
        getSTReferenceOutput("testGroup", "testZipMap", data, function (refOutput, errors) {
            t = group.getTemplate("/testZipMap");
            expect(t).not.toBeNull();
            // there are no arguments
            t.setArgs(data);
            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
        });
    });
});

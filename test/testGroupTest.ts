/*global describe, it*/

"use strict";

import path from "path";
import { loadGroup, makeWriter } from "../lib";
const testTemplateGroup = require("./testGroup_stg");

import { spawn } from "child_process";

function getSTReferenceOutput(
  group: any,
  template: any,
  data: any,
  callback: Function,
  options: any = {}
) {
  var output = "";
  var errOutput = "";
  var args = (options || []).concat([options || "", group + "." + template]);

  var stst = spawn("stst_java", args, {
    cwd: path.dirname(options.filename),
    stdio: ["pipe", "pipe", "pipe"]
  });

  stst.stdin.write(JSON.stringify(data));
  stst.stdin.end();

  stst.stdout.on("data", (data: any) => {
    output += data;
  });

  stst.stderr.on("data", (data: any) => {
    errOutput += data;
  });

  stst.on("close", () => {
    callback(output, errOutput);
  });
}

describe("test group test", () => {
  it("should generate same output as reference implementation for template testEscapes", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput("testGroup", "testEscapes", {}, (refOutput: any) => {
      t = group.getTemplate("/testEscapes");
      expect(t).not.toBeNull();
      // there are no arguments

      t.write(writer);
      expect(writer.toString()).toBe(refOutput);
      done();
    });
  });

  it("should generate same output as reference implementation for template testLiterals", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput("testGroup", "testLiterals", {}, (refOutput: any) => {
      t = group.getTemplate("/testLiterals");
      expect(t).not.toBeNull();
      // there are no arguments

      t.write(writer);
      expect(writer.toString()).toBe(refOutput);
      done();
    });
  });

  it("should generate same output as reference implementation for template testDictionaryAccess", done => {
    let t;
    let group = loadGroup(testTemplateGroup);
    let writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testDictionaryAccess",
      { a: "value of a" },
      (refOutput: any) => {
        t = group.getTemplate("/testDictionaryAccess");
        expect(t).not.toBeNull();
        t.setArgs({ a: "value of a" });

        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testDictionaryAccessAlt", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testDictionaryAccessAlt",
      { a: "one" },
      (refOutput: any) => {
        t = group.getTemplate("/testDictionaryAccessAlt");
        expect(t).not.toBeNull();
        t.setArgs({ a: "one" });

        t.write(writer);
        expect(writer.toString()).toBe(refOutput);

        writer = makeWriter();
        getSTReferenceOutput(
          "testGroup",
          "testDictionaryAccessAlt",
          { a: "two" },
          (refOutput: any) => {
            t = group.getTemplate("/testDictionaryAccessAlt");
            expect(t).not.toBeNull();
            t.setArgs({ a: "two" });

            t.write(writer);
            expect(writer.toString()).toBe(refOutput);
            done();
          }
        );
      }
    );
  });

  it("should generate same output as reference implementation for template simple", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "simple",
      {
        arg1: {
          hasTitle: true,
          title: "Mr",
          first: "Sam",
          last: "Smith"
        }
      },
      (refOutput: any) => {
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
        writer = makeWriter();
        getSTReferenceOutput(
          "testGroup",
          "simple",
          {
            arg1: {
              hasTitle: false,
              first: "Sam",
              last: "Smith"
            }
          },
          (refOutput: any) => {
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
          }
        );
      }
    );
  });

  it("should generate same output as reference implementation for template testArgsCaller with no args passed in", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testArgsCaller",
      {},
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testArgsCaller");
        expect(t).not.toBeNull();
        // there are no arguments

        console.log("xxx errors: " + errors);
        t.write(writer);
        expect(writer.toString()).toBe(refOutput); // xxx need to verify runtime errors and results separately
        // xxx pass throught not yet hooked up
        // xxx seems to be a difference with extra new line
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testMap", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter({ lineWidth: 20 });

    getSTReferenceOutput(
      "testGroup",
      "testMap",
      { list: ["apple", "banana", null, "orange"] },
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testMap");
        expect(t).not.toBeNull();
        // there are no arguments

        console.log("xxx errors: " + errors);
        t.setArgs([["apple", "banana", null, "orange"]]);
        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      },
      ["-w", "20"]
    );
  });

  it("should generate same output as reference implementation for template testMapRot", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testMapRot",
      { board: ["x", " ", "X", "O", "O", "X", " ", " ", " "] },
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testMapRot");
        expect(t).not.toBeNull();
        // there are no arguments

        t.setArgs({ board: ["x", " ", "X", "O", "O", "X", " ", " ", " "] });
        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testPropIndirect", done => {
    var t,
      attrs = {
        names: [
          { last: "Smith", first: "Max" },
          { last: "Jones", first: "Sam" }
        ],
        propName: "last"
      },
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testPropIndirect",
      attrs,
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testPropIndirect");
        expect(t).not.toBeNull();
        // there are no arguments

        t.setArgs(attrs);
        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testIncludeIndirect", done => {
    var t,
      attrs = {},
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testIncludeIndirect",
      attrs,
      (refOutput: any, errors: any) => {
        t = group.getTemplate("testIncludeIndirect");
        expect(t).not.toBeNull();
        // there are no arguments

        t.setArgs(attrs);
        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testNestedPropRef", done => {
    var t,
      attrs = {
        deep: { level1: { things: { stuff: "gold", junk: "lemon" } } }
      },
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testNestedPropRef",
      attrs,
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testNestedPropRef");
        expect(t).not.toBeNull();
        // there are no arguments

        t.setArgs(attrs);
        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testEmptyTemplates", done => {
    var t,
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testEmptyTemplates",
      {},
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testEmptyTemplates");
        expect(t).not.toBeNull();
        // there are no arguments

        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });

  it("should generate same output as reference implementation for template testZipMap", done => {
    var t,
      data = {
        zipC1: ["obj1", "thing", "obj2", "obj2"],
        zipC2: ["p1", "wrench", "x", "p2"],
        zipC3: ["apple", "10092", "foo"]
      },
      group = loadGroup(testTemplateGroup),
      writer = makeWriter();

    getSTReferenceOutput(
      "testGroup",
      "testZipMap",
      data,
      (refOutput: any, errors: any) => {
        t = group.getTemplate("/testZipMap");
        expect(t).not.toBeNull();
        // there are no arguments

        t.setArgs(data);
        t.write(writer);
        expect(writer.toString()).toBe(refOutput);
        done();
      }
    );
  });
});

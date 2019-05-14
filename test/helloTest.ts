/*global describe, it*/

"use strict";

import { loadGroup, makeWriter } from "../lib";
const helloTemplateGroup = require("./hello.st");

describe("hello world test", () => {
  it("should generate the expected string", () => {
    let t,
      group = loadGroup(helloTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("/hello");
    expect(t).not.toBeNull();
    t.add("audience", "world");
    t.write(writer);
    const expected = "Hello world!" + writer.eol;
    expect(writer.toString()).toEqual(expected);
  });

  it("should generate the expected string with null input", () => {
    let t,
      group = loadGroup(helloTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("/hello");
    expect(t).not.toBeNull();
    t.add("audience", null);
    t.write(writer);
    const expected = "Hello is anyone there?!" + writer.eol;
    expect(writer.toString()).toEqual(expected);
  });

  it("should generate the expected string with an array", () => {
    let t,
      group = loadGroup(helloTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("hello");
    expect(t).not.toBeNull();
    t.add("audience", ["Bob", "Sue", "Dan"]);
    t.write(writer);
    const expected = "Hello Bob, Sue, Dan!" + writer.eol;
    expect(writer.toString()).toEqual(expected);
  });

  it("should generate the expected string with a single item array", () => {
    let t,
      group = loadGroup(helloTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("hello");
    expect(t).not.toBeNull();
    t.add("audience", ["world"]);
    t.write(writer);
    const expected = "Hello world!" + writer.eol;
    expect(writer.toString()).toEqual(expected);
  });

  it("should generate the expected string with an empty array", () => {
    let t,
      group = loadGroup(helloTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("hello");
    expect(t).not.toBeNull();
    t.add("audience", []);
    t.write(writer);
    const expected = "Hello !" + writer.eol;
    expect(writer.toString()).toEqual(expected);
  });

  it("should generate the expected string when there is renderer", () => {
    let t,
      rc = { test: "don't care" },
      group = loadGroup(helloTemplateGroup),
      writer = makeWriter();

    t = group.getTemplate("hello");
    group.registerAttributeRenderer(
      "string",
      (value: any, fmt: any, context: any) => {
        expect(fmt).toBeNull();
        expect(context).toEqual(rc);
        return value.toUpperCase();
      }
    );
    expect(t).not.toBeNull();
    t.add("audience", "world");
    t.write(writer, rc);
    const expected = "Hello WORLD!" + writer.eol;
    expect(writer.toString()).toEqual(expected);
  });
});

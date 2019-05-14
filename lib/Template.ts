/*
 [The "BSD licence"]
 Copyright (c) 2015, John Snyders
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 1. Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 3. The name of the author may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * This is the Template class.
 * @module lib/Template
 */
"use strict";

import { isArray } from "util";
import { copyProperties } from "./util";

/**
 * Constructor for Template objects. A Template is a runtime instance of a template definition that
 * includes the scope in which the template is called and any actual arguments. All templates
 * must be associated with a group. The Template constructor function should not be used directly.
 * To get a Template call Group.getTemplate.
 *
 * Basic usage:
 * var myTemplate = myGroup.getTemplate("myTemplate");
 * myTemplate.setArgs(["first-arg-value", "second-arg-value"]);
 * myTemplate.write(writer);
 * console.log(writer.toString());
 *
 * For raw templates use add method rather than setArgs.
 *
 * @param scope Empty object with prototype chain that establishes the template scope
 * @param owningGroup The group that created this template. This may not be the group that template is defined in.
 * @param render The compiled template. A function called by the write method that renders the template to the
 * writer according to the template definition.
 * @param isAnonSubtemplate optional set to true if the template is a anonymous sub template
 * @constructor
 * @alias module:lib/Template
 */

type IRender = (writer: any, renderContext: any) => string;

type IRenderer = {
  render: IRender;
  args: any;
};

interface IObj {
  [key: string]: any;
}

const matchName = (i: any) => {
  return i.name === name;
};

export class Template {
  scope: any;
  owningGroup: any;
  renderer: IRenderer;
  isAnonSubtemplate: boolean;
  argsPassThrough: boolean;
  _hasParentScope: boolean = false;

  constructor(
    scope: any,
    owningGroup: any,
    renderer: IRenderer,
    isAnonSubtemplate: boolean = false
  ) {
    this.scope = scope;
    this.owningGroup = owningGroup;
    this.renderer = renderer;
    this.argsPassThrough = false;
    this.isAnonSubtemplate = isAnonSubtemplate || false;
  }

  /**
   * Set the arguments to this template. The arguments can be given in an array
   * or in an object. Using an array corresponds to calling with positional arguments:
   *     template(arg1, arg2)
   * Using an object corresponds to calling with named parameters
   *     template(a=arg1, b=arg2)
   * @param args array or object of arguments
   * @param passThrough optional. Typically only for internal use. This corresponds to the ... call syntax.
   */
  setArgs(args: any, passThrough: boolean = false) {
    isArray(args) ? this.setArrayArgs(args) : this.setObjArgs(args);

    if (passThrough) {
      this.argsPassThrough = true;
    }
  }

  get renderArgs() {
    return this.renderer.args;
  }

  setObjArgs(args: IObj) {
    let value;
    // must be an object
    for (let name in args) {
      if (args.hasOwnProperty(name)) {
        if (name.indexOf(".") >= 0) {
          // todo think should validate that name is an ID?
          throw new Error(
            "Invalid character '.' in attribute name. Invalid name '" +
              name +
              "'."
          );
        } else {
          value = args[name];
          if (!this.renderArgs.find(matchName)) {
            this.owningGroup.reportRuntimeError(
              new Error("No such named argument '" + name + "'.")
            );
          } else {
            this.scope[name] = value;
          }
        }
      }
    }
  }

  setArrayArgs(args: any[]) {
    let name, value;
    let len = args.length;
    if (len > this.renderArgs.length) {
      // xxx consider how to get source line, column
      this.owningGroup.reportRuntimeError(
        new Error(
          "Too many actual arguments. Expected " +
            this.renderArgs.length +
            " but " +
            len +
            " supplied."
        )
      );
      len = this.renderArgs.length;
    }
    for (let i = 0; i < len; i++) {
      name = this.renderer.args[i].name;
      value = args[i];
      this.scope[name] = value;
    }
  }

  /**
   * Adds attributes as arguments to this template. Typically only used for raw templates.
   * @param {string} name
   * @param {*} value
   */
  add(name: string, value: any) {
    // todo consider if this is not a raw template verifying that name is one of the formal args
    if (name.indexOf(".") >= 0) {
      // todo think should validate that name is an ID?
      throw new Error(
        "Invalid character '.' in attribute name. Invalid name '" + name + "'."
      );
    }
    this.scope[name] = value;
  }

  /**
   * Clear all attributes added to a template to prepare it to be used again
   */
  clear() {
    var p;
    for (p in this.scope) {
      if (this.scope.hasOwnProperty(p)) {
        delete this.scope[p];
      }
    }
    this.argsPassThrough = false;
  }

  /**
   * Generate template output by processing the template and writing the rendered output to the given writer.
   *
   * @param {writer} writer object implementing the writer interface. See autoIndentWriter.js
   * @param {object} renderContext an object to pass to any attribute renderer. @see stGroup~registerAttributeRenderer.
   */
  write(writer: any, renderContext?: any) {
    var i, a;
    // xxx does this go here or in runtime? Want to only do this once?

    // set all args, including defaults, and passthrough
    if (this.renderArgs) {
      for (i = 0; i < this.renderArgs.length; i++) {
        a = this.renderArgs[i];
        if (!this.scope.hasOwnProperty(a.name)) {
          // the formal argument a.name has not been given a value
          // if argsPassThrough (...) has been specified don't let this argument name hide attributes in parent scopes
          // otherwise set the formal arg to its default if it has one otherwise null
          if (!this.argsPassThrough) {
            this.scope[a.name] = a.default || null;
          }
        }
      }
    }
    this.render(writer, renderContext);
  }

  get render() {
    return this.renderer.render;
  }

  /**
   * For internal runtime use only
   * @param {*} value
   * @private
   */
  addImplicit(value: any) {
    var name;

    if (this.renderArgs.length < 1) {
      name = "it";
    } else {
      name = this.renderArgs[0].name;
    }
    this.scope[name] = value;
  }

  /**
   * For internal runtime use only
   * @param scope
   * @private
   */
  setScope(scope: any) {
    var oldScope = this.scope;
    this.scope = Object.create(scope);
    // copy properties
    copyProperties(oldScope, this.scope);
  }

  /**
   * For internal runtime use only
   * @param scope
   * @private
   */
  clone() {
    var that = new Template(
      {},
      this.owningGroup,
      this.renderer,
      this.isAnonSubtemplate
    );
    that.argsPassThrough = this.argsPassThrough;
    // copy the args but not the scope. _hasParentScope is undefined
    copyProperties(this.scope, that.scope);
    return that;
  }
}

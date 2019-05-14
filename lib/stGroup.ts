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

/*
 * This is the prototype stGroup object. It is used to make specific groups
 */
/**
 * @module stGroup
    import AutoIndentWriter = .exports =.AutoIndentWriter;
 */
"use strict";

import { Template } from "./Template";
import { AutoIndentWriter, makeWriter } from "./AutoIndentWriter";
//isArray = require("util").isArray,
import { Errors } from "./errors";

import * as util from "./util";
import { AttributeRenderer } from "./AttributeRenderer";

export const makeInitialScope = (group: any) => {
  let i: any;
  let initialScope: any;
  let curGroup: any;
  let curScope = null;
  let orderedGroups: any[] = [];

  function orderGroups(curGroup: any) {
    var i;
    for (i = curGroup.imports.length - 1; i >= 0; i--) {
      orderGroups(curGroup.imports[i]);
    }
    orderedGroups.push(curGroup);
  }

  orderGroups(group);

  for (i = 0; i < orderedGroups.length; i++) {
    curGroup = orderedGroups[i];
    if (Object.keys(curGroup.dictionaries).length > 0) {
      if (curScope) {
        curScope = Object.create(curScope);
      } else {
        curScope = {};
      }
      util.copyProperties(curGroup.dictionaries, curScope);
    }
  }

  if (curScope) {
    initialScope = Object.create(curScope);
  } else {
    initialScope = {};
  }
  return initialScope;
};

interface IStrMap {
  [key: string]: any;
}

export class StringTemplateGroup {
  renderers: IStrMap = {};
  dictionaries: IStrMap = {};
  templates: IStrMap = {};
  modelAdaptors: IStrMap = {};
  imports: any[] = [];
  errorListener: any;
  /**
   * Simplified interface to rendering a template. Alternative to calling getTemplate and then setArgs
   * and write on the template.
   *
   * @param name {string} template name
   * @param args {array|object} array or map of the arguments to pass to the template.
   * @param writer optional writer to use the default is to use an autoIndentWriter.
   * @returns {string} the rendered template
   */
  render(name: string, args: any[], writer: any) {
    let t;

    if (!writer) {
      writer = makeWriter();
    }
    t = this.getTemplate(name);
    /*xxx        if (t.render.args.length === 0) {
            if (isArray(args) || !typeof args === "object") {
                throw new Error("Args must be an object for a raw template");
            }
            for (attr in args) {
                if (args.hasOwnProperty(attr)) {
                    t.add(args);
                }
            }
        } else { */
    t.setArgs(args);
    //xxx        }
    t.write(writer);
    return writer.toString();
  }

  /**
   * Add a named dictionary to the group.
   *
   * @param name name of dictionary
   * @param dict Dictionary object
   */
  addDictionary(name: string, dict: any) {
    this.dictionaries[name] = dict;
  }

  /**
   * Add import
   * @param group
   */
  addImport(group: any) {
    this.imports.push(group);
  }

  /**
   * Add a named template render function
   * @param name
   * @param templateFn
   */
  addTemplate(name: string, templateFn: Function) {
    this.templates[name] = templateFn;
  }

  /**
   *
   * @param aliasName
   * @param targetName
   */
  addTemplateAlias(aliasName: string, targetName: string) {
    var tf = this.templates[targetName]; // don't use lookupTemplateFn the target must be in the same group

    if (!tf) {
      // xxx not sure if this should throw or go through reportRuntimeError
      throw Error("No such template '" + targetName + "'.");
    }
    this.templates[aliasName] = tf;
  }

  /*
   * Look for a template function named 'name' in this group and if not found look in each
   * imported group in order. This ends up doing a depth first search of the import tree.
   */
  lookupTemplateFn(name: string) {
    var i,
      g,
      tf = this.templates[name];
    if (tf) {
      return tf;
    } // else
    for (i = 0; i < this.imports.length; i++) {
      g = this.imports[i];
      tf = g.lookupTemplateFn(name);
      if (tf) {
        return tf;
      }
    }
    return null;
  }

  /**
   * getTemplate
   * Returns a template instance for the given name.
   *
   * While processing a template, templates are always looked up starting
   * at the template's owning group and since the templates returned have the
   * same owning group used to do the lookup all templates are looked up
   * starting at the group on which the initial getTemplate call was made.
   *
   * @param name template name. Template names may include / path characters. These are just part of the name.
   * @param parentScope optional parent scope - for internal use only
   * @returns {Template} Template instance
   */
  getTemplate(name: string, parentScope?: any) {
    let template, scope, trf;

    if (name.substr(0, 1) !== "/") {
      name = "/" + name;
    }
    trf = this.lookupTemplateFn(name);

    if (!trf) {
      this.reportRuntimeError(Error("No such template '" + name + "'."));
    }

    // turn this template function into a template object
    if (parentScope) {
      scope = Object.create(parentScope);
    } else {
      scope = makeInitialScope(this);
    }
    template = new Template(scope, this, trf);
    if (parentScope) {
      template._hasParentScope = true;
    }
    return template;
  }

  reportRuntimeError(location: any, type?: any, arg1?: any, arg2?: any) {
    var error, message, locPrefix;
    location = location || {};
    switch (type) {
      case Errors.st.ATTRIBUTE_NOT_FOUND:
        message = "Attribute '" + arg2 + "' not found.";
        break;
      case Errors.st.PROPERTY_NOT_FOUND:
        message = "Property '" + arg2 + "' not found.";
        break;
      // xxx more
      default:
        message = "Unknown error.";
    }
    // xxx would be nice if location included a template call stack
    error = new Errors().STRuntimeMessage(
      type,
      message,
      location.file,
      location.line,
      location.column
    );
    error.arg1 = arg1;
    error.arg2 = arg2;
    if (this.errorListener) {
      this.errorListener(error);
    } else {
      locPrefix = "";
      if (location.file) {
        locPrefix += "(" + location.file;
        if (location.line) {
          locPrefix += "," + location.line;
          if (location.column) {
            locPrefix += "," + location.column;
          }
        }
        locPrefix += "): ";
      }
      console.log(locPrefix + "Runtime error: " + message);
    }
  }

  /**
   * Set the error listener which is called for any runtime errors
   * @param listener  function(Error)
   */
  setErrorListener(listener: any) {
    this.errorListener = listener;
  }

  /**
   * Get the error listener
   * @param listener function(Error)
   */
  getErrorListener(listener: any) {
    this.errorListener = listener;
  }

  /**
   * Register a rendering function that will be called to render attribute values
   * of the specified type. The render function is called with:
   *   the value to be rendered,
   *   format string, which is the value of the template expression format option or null if there is no format option,
   *   the renderContext that is passed to template.write This can hold context information such as the locale, output encoding
   *      or anything else needed by the renderer functions
   * the render function must return a string representation of the value.
   *
   * @param typeName one of: array, date, error, function, number, object, regexp, string, or constructor function name e.g. MyThing
   *          String Template iterates over arrays so it is very unlikely that an array is ever rendered
   *          function and regexp are probably not very useful or likely
   * @param renderer function(value, formatString, renderContext) returns string
   */
  registerAttributeRenderer(typeName: string, renderer: any) {
    this.renderers[typeName] = renderer;
  }

  /**
   * Return a rendering function for the given type name. See registerAttributeRenderer.
   * @param typeName
   * @returns {function|null}
   */
  getAttributeRenderer(typeName: string) {
    return this.renderers[typeName] || null;
  }

  /**
   * Register a model adaptor. The model adaptor is responsible for accessing properties of instances of the given type.
   *
   * @param typeName type or class name to handle property access for
   * @param adaptor function(object, propertyName) returns value of property. If the property does not exist return undefined.
   */
  registerModelAdaptor(typeName: string, adaptor: any) {
    this.modelAdaptors[typeName] = adaptor;
  }

  /**
   * Return a modelAdaptor function for the given type name. See registerModelAdaptor.
   * @param typeName
   * @returns {function|null}
   */
  getModelAdaptor(typeName: string) {
    return this.modelAdaptors[typeName] || null;
  }
}

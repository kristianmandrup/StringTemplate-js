import { StringTemplate } from "../lib/stRuntime";
/*
 * hand crafted template
 */

export const getInstance = (st: StringTemplate, group: any) => {
  group.name = "hello";

  /*
     Template hello.st:
     hello(audience) ::= <%Hello $audience;null="is anyone there?",separator=", "$!$!this is the syntax for a comment inside a template!$
     %>
     */
  group.addTemplate("/hello", (w: any, rc: any) => {
    var g = group.owningGroup,
      s = group.scope;
    w.write("Hello ");
    st.write(w, s, g, rc, s.audience, {
      null: "is anyone there?",
      separator: ", "
    });
    w.write("!\n");
  }); // xxx need info about args, perhaps add as properties of the function

  return group;
};

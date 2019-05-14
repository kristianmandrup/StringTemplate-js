"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * hand crafted template
 */
exports.getInstance = function (st, group) {
    group.name = "hello";
    /*
       Template hello.st:
       hello(audience) ::= <%Hello $audience;null="is anyone there?",separator=", "$!$!this is the syntax for a comment inside a template!$
       %>
       */
    group.addTemplate("/hello", function (w, rc) {
        var g = group.owningGroup, s = group.scope;
        w.write("Hello ");
        st.write(w, s, g, rc, s.audience, {
            null: "is anyone there?",
            separator: ", "
        });
        w.write("!\n");
    }); // xxx need info about args, perhaps add as properties of the function
    return group;
};

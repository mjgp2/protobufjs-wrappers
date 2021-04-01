const tape = require("tape");
const { inspect } = require('util');
const protobuf = require("protobufjs");
require('../index');

const root = protobuf.Root.fromJSON({
    nested: {
        Foo: {
            fields: {
                foo: {
                    id: 1,
                    type: "google.protobuf.Struct"
                }
            }
        }
    }
})
    .addJSON(protobuf.common["google/protobuf/struct.proto"].nested)
    .resolveAll();

const Struct = root.lookupType("protobuf.Struct"),
    Value = root.lookupType("protobuf.Value"),
    Foo = root.lookupType(".Foo");

tape.test("google.protobuf.Struct", function (test) {
    const foo = Foo.fromObject({
        foo: {
            a: null,
            b: 1,
            c: 'd',
            e: false,
            f: { g: 2 },
            h: [null, 3, 'i', true]
        }
    });

    test.ok(foo.foo instanceof Struct.ctor, "foo should be Struct");
    Object.keys(foo.foo.fields).forEach(function (k) {
        test.ok(foo.foo.fields[k] instanceof Value.ctor, "foo." + k + " should be Value");
    });
    console.log(inspect(foo, false, 10));
    const expected = {
        foo: {
            fields: {
                a: { nullValue: 0 },
                b: { numberValue: 1 },
                c: { stringValue: "d" },
                e: { boolValue: false },
                f: {
                    structValue: {
                        fields: {
                            g: { numberValue: 2 }
                        }
                    }
                },
                h: {
                    listValue: {
                        values: [
                            { nullValue: 0 },
                            { numberValue: 3 },
                            { stringValue: "i" },
                            { boolValue: true }
                        ]
                    }
                }
            }
        }
    };
    test.deepEqual(foo, expected);

    const obj = Foo.toObject(foo);
    test.deepEqual(obj, {
        foo: {
            a: null,
            b: 1,
            c: 'd',
            e: false,
            f: { g: 2 },
            h: [null, 3, 'i', true]
        }
    });

    test.end();
});
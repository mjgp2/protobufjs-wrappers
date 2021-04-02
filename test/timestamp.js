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
                    type: "google.protobuf.Timestamp"
                }
            }
        }
    }
})
    .addJSON(protobuf.common["google/protobuf/timestamp.proto"].nested)
    .resolveAll();

const Timestamp = root.lookupType("google.protobuf.Timestamp"),
    Foo = root.lookupType(".Foo");

tape.test("google.protobuf.Struct", function (test) {

    const date = new Date(123456789);

    const foo = Foo.fromObject({
        foo: date
    });

    test.ok(foo.foo instanceof Timestamp.ctor, "foo should be Timestamp");
    const expected = {
        foo: {
            "seconds": 123456,
            "nanos": 789e6,
        }
    };
    test.deepEqual(foo, expected);

    const obj = Foo.toObject(foo);
    test.deepEqual(obj, { foo: date } );

    test.end();
});
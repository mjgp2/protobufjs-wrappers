const { wrappers } = require('protobufjs');

// Custom wrapper for Timestamp
wrappers[".google.protobuf.Timestamp"] = {
  fromObject: function(object) {
      //Convert ISO-8601 to epoch millis
      const dt = new Date(object).getTime();
      return this.create({
          seconds: Math.floor(dt/1000),
          nanos: (dt % 1000) * 1e6
      })
  },

  toObject: function(message, options) {
      return new Date(Number(message.seconds)*1000 + Math.floor(Number(message.nanos)/1e6));
  }
};

// see - https://github.com/protobufjs/protobuf.js/pull/929/files

// Custom wrapper for ListValue
wrappers[".google.protobuf.ListValue"] = {
  fromObject: function(object) {
      const Value = this.lookup("google.protobuf.Value");
      return this.create({values: object.map(Value.fromObject)});
  },

  toObject: function(message /*, options */) {
      const Value = this.lookup("google.protobuf.Value");
      return message.values.map(Value.toObject);
  }
};

// Custom wrapper for Value
wrappers[".google.protobuf.Value"] = {
  // given a plain javascript scalar or object, return a protobuf Value
  fromObject: function(object) {
      
      let valueDef;
      if (object === null) {
          const NullValue = this.lookup("google.protobuf.NullValue");
          valueDef = {nullValue: NullValue.values.NULL_VALUE};
        } else if (typeof object === "number") {
            valueDef = {numberValue: object};
        } else if (typeof object === "string") {
            valueDef = {stringValue: object};
        } else if (typeof object === "boolean") {
            valueDef = {boolValue: object};
        } else if (Array.isArray(object)) {
            const ListValue = this.lookup("google.protobuf.ListValue");
            valueDef = {listValue: ListValue.fromObject(object)};
        } else if (typeof object === "object") {
          const Struct = this.lookup("google.protobuf.Struct");
          valueDef = {structValue: Struct.fromObject(object)};
      } else {
          return valueDef = {nullValue: 0};
      }
      return this.create(valueDef);
  },

  toObject: function(message, options) {
      
      let object;
      if (message.kind === "nullValue") {
          object = null;
        } else if (message.kind === "numberValue") {
            object = message.numberValue;
        } else if (message.kind === "stringValue") {
            object = message.stringValue;
        } else if (message.kind === "boolValue") {
            object = message.boolValue;
        } else if (message.kind === "structValue") {
            const Struct = this.lookup("google.protobuf.Struct");
            object = Struct.toObject(message.structValue, options);
        } else if (message.kind === "listValue") {
          const ListValue = this.lookup("google.protobuf.ListValue");
          object = ListValue.toObject(message.listValue, options);
      }

      return object;
  }
};

// Custom wrapper for Struct
wrappers[".google.protobuf.Struct"] = {

  // given a plain javascript object, return a protobuf Struct object
  fromObject: function(object) {
      const Value = this.lookup("google.protobuf.Value");
      const structDef = {fields: {}};

      for (const k in object) {
          structDef.fields[k] = Value.fromObject(object[k]);
      }
      return this.create(structDef);
  },

  // given a protobuf Struct object, return a plain JS object
  toObject: function(message, options) {
      const Value = this.lookup("google.protobuf.Value");
      const object = {};
      const fields = message.fields;
      for (const k in fields) {
          object[k] = Value.toObject(fields[k], options);
      }
      return object;
  }
};
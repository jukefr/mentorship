export = {
  type: "object",
  additionalProperties: false,
  required: ["hello"],
  items: { hello: { type: "string" } }
};

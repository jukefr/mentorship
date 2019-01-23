export = {
  type: "object",
  additionalProperties: false,
  required: ["sub"],
  items: {
    name: { type: "string" },
    nickname: { type: "string" },
    email: { type: "string" },
    picture: { type: "string" },
    sub: { type: "string" }
  }
};

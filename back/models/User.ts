export = {
  type: "object",
  required: ["sub"],
  items: {
    name: { type: "string" },
    nickname: { type: "string" },
    email: { type: "string" },
    picture: { type: "string" },
    sub: { type: "string" }
  }
};

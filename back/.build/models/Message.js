"use strict";
module.exports = {
    type: "object",
    required: ["subDestination", "subOrigin", "message", "date"],
    items: {
        id: { type: "string" },
        subDestination: { type: "string" },
        message: { type: "string" },
        subOrigin: { type: "string" },
        date: { type: "integer" }
    }
};

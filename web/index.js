import { api } from "../../scripts/api.js";

import(api.api_base + "/client/index.js")
      .then(module => {
        console.log("GPT extension loaded successfully");
      })
      .catch(error => {
        console.error("Failed to load GPT extension:", error);
      });
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: "english_app.db",
    },
});

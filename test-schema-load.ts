import { insertFoundItemSchema } from "./shared/schema";

try {
  console.log("Schema loaded successfully");
  console.log("Found Item Schema:", insertFoundItemSchema);
} catch (error) {
  console.error("Schema loading failed:", error);
}

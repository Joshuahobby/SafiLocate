console.log("Attempting to import server/routes.ts...");
import("./server/routes.ts")
  .then(() => console.log("Import successful."))
  .catch((error) => {
    console.error("Import failed:", error);
    console.error(JSON.stringify(error, null, 2));
  });

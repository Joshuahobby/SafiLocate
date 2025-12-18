
async function main() {
    try {
        const res = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "password123" })
        });

        if (res.ok) {
            console.log("Success: Admin user created via API.");
        } else {
            const text = await res.text();
            console.log(`Failed: ${res.status} - ${text}`);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
main();

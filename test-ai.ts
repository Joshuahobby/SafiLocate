import { aiService } from "./server/services/ai.service";

async function testAI() {
    console.log("Testing AI Service...");

    const testCases = [
        {
            title: "Lost Blue iPhone 13",
            description: "I lost my blue iPhone 13 Pro Max in a red case near the cafe."
        },
        {
            title: "Black Leather Wallet",
            description: "Found a black leather wallet containing an ID card for John Doe."
        }
    ];

    for (const test of testCases) {
        console.log(`\nAnalyzing: "${test.title}"`);
        const tags = await aiService.generateTags(test.title, test.description);
        console.log("Tags:", tags);
    }
}

testAI().catch(console.error);

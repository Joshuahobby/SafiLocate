import OpenAI from "openai";

// Simple keyword extraction service
// Enhanced with OpenAI integration
export class AIService {
    private openai: OpenAI | null = null;
    private stopWords = new Set([
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her",
        "she", "or", "an", "will", "my", "one", "all", "would", "there",
        "their", "what", "so", "up", "out", "if", "about", "who", "get",
        "which", "go", "me", "when", "make", "can", "like", "time", "no",
        "just", "him", "know", "take", "people", "into", "year", "your",
        "good", "some", "could", "them", "see", "other", "than", "then",
        "now", "look", "only", "come", "its", "over", "think", "also",
        "back", "after", "use", "two", "how", "our", "work", "first",
        "well", "way", "even", "new", "want", "because", "any", "these",
        "give", "day", "most", "us", "item", "lost", "found", "looking",
        "please", "help", "contact", "iphone", "samsung", "phone" // specific common words might be redundant as tags if category covers them, but useful for search
    ]);

    constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } else {
            console.warn("OPENAI_API_KEY not found. AI features will fallback to basic keywords.");
        }
    }

    async generateTags(title: string, description: string): Promise<string[]> {
        // Try OpenAI first
        if (this.openai) {
            try {
                const response = await this.openai.chat.completions.create({
                    model: "gpt-4o", // or gpt-3.5-turbo if cost is a concern, but 4o is better for this
                    messages: [
                        {
                            role: "system",
                            content: `You are a helpful assistant that extracts tags from lost and found item descriptions. 
                            Return a JSON object with a single key 'tags' containing an array of up to 8 relevant strings.
                            Tags should be single words or short phrases, lowercase, relevant for search.
                            Example: {"tags": ["iphone", "blue", "apple", "electronics", "smartphone"]}`
                        },
                        {
                            role: "user",
                            content: `Title: ${title}\nDescription: ${description}`
                        }
                    ],
                    response_format: { type: "json_object" }
                });

                const content = response.choices[0].message.content;
                if (content) {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed.tags)) {
                        console.log("AI Tags generated:", parsed.tags);
                        return parsed.tags;
                    }
                }
            } catch (error) {
                console.error("OpenAI API failed, falling back to keywords:", error);
            }
        }

        return this.generateTagsFallback(title, description);
    }

    private async generateTagsFallback(title: string, description: string): Promise<string[]> {
        const text = `${title} ${description}`.toLowerCase();

        // Remove punctuation and special characters
        const cleanText = text.replace(/[^\w\s]/g, '');

        // Split into words
        const words = cleanText.split(/\s+/);

        // Filter words
        const keywords = words.filter(word =>
            word.length > 2 &&
            !this.stopWords.has(word) &&
            !/^\d+$/.test(word) // remove pure numbers
        );

        // Count frequency
        const frequency: Record<string, number> = {};
        keywords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Sort by frequency
        const sortedKeywords = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([word]) => word);

        // Return top 8 unique tags
        return sortedKeywords.slice(0, 8);
    }
}

export const aiService = new AIService();

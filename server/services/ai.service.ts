
// Simple keyword extraction service
// In the future, this can be enhanced with OpenAI integration

export class AIService {
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

    async generateTags(title: string, description: string): Promise<string[]> {
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

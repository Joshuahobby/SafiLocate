import { storage } from "../storage";
import { type FoundItem, type LostItem } from "@shared/schema";

class MatchingService {
    /**
     * Find potential matches for a newly reported item
     * @param newItem The newly created item (Found or Lost)
     * @param type The type of the new item ('found' or 'lost')
     */
    async findPotentialMatches(newItem: FoundItem | LostItem, type: 'found' | 'lost') {
        console.log(`[MatchingService] Searching for matches for ${type} item: ${newItem.title} (${newItem.id})`);

        let potentialMatches: (FoundItem | LostItem)[] = [];

        // If new item is FOUND, look for LOST items
        if (type === 'found') {
            const lostItems = await storage.getLostItems(); // usage of getLostItems might need filters if available
            // Filter manually for now as storage might not have advanced filters yet
            potentialMatches = lostItems.filter(lost =>
                lost.status === 'active' && // Only active lost items
                lost.category === newItem.category // Must match category
            );
        }
        // If new item is LOST, look for FOUND items
        else {
            const foundItems = await storage.getFoundItems();
            potentialMatches = foundItems.filter(found =>
                found.status === 'active' && // Only active found items
                found.category === newItem.category // Must match category
            );
        }

        // specific matching logic (Tag Overlap)
        const matches = potentialMatches.map(match => {
            const score = this.calculateMatchScore(newItem, match);
            return { item: match, score };
        })
            .filter(result => result.score > 0) // Only keep items with some relevance
            .sort((a, b) => b.score - a.score) // Sort by highest score
            .slice(0, 5); // Top 5 matches

        if (matches.length > 0) {
            console.log(`[MatchingService] Found ${matches.length} potential matches!`);
            matches.forEach(m => {
                console.log(`   - MATCH (${Math.round(m.score * 100)}%): ${m.item.title} [ID: ${m.item.id}]`);
                // Here we would ideally trigger a notification (email/SMS/in-app)
                // notifyUser(m.item, newItem);
            });
        } else {
            console.log(`[MatchingService] No strong matches found.`);
        }

        return matches;
    }

    private calculateMatchScore(item1: FoundItem | LostItem, item2: FoundItem | LostItem): number {
        let score = 0;

        // 1. Tag Overlap (High weight)
        const tags1 = item1.tags || [];
        const tags2 = item2.tags || [];

        if (tags1.length > 0 && tags2.length > 0) {
            const commonTags = tags1.filter(tag => tags2.includes(tag));
            const unionTags = new Set([...tags1, ...tags2]);

            // Jaccard index for tags
            if (unionTags.size > 0) {
                score += (commonTags.length / unionTags.size) * 0.7; // 70% of score comes from tags
            }
        }

        // 2. Keyword matching in Title/Description (Fallback/Additional)
        const text1 = (item1.title + " " + item1.description).toLowerCase();
        const text2 = (item2.title + " " + item2.description).toLowerCase();

        // Simple word overlap check if tags fail
        if (score === 0) {
            const words1 = text1.split(/\s+/).filter(w => w.length > 3);
            const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));
            const commonWords = words1.filter(w => words2.has(w));

            if (words1.length > 0) {
                score += (commonWords.length / words1.length) * 0.3;
            }
        }

        return score;
    }
}

export const matchingService = new MatchingService();

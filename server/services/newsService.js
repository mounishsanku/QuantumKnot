import axios from "axios";

/**
 * News Service — NewsAPI Integration
 * 
 * Logic:
 * 1. Search for city-specific disruptions (strikes, bandhs, curfews)
 * 2. Return detection status and type
 */
export async function detectDisruption(city) {
  try {
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      console.log("[API] News fallback used (No API Key)");
      return { detected: false };
    }

    const keywords = ["strike", "bandh", "curfew"];
    const query = `${city} AND (${keywords.join(" OR ")})`;
    
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&apiKey=${API_KEY}`;
    
    const { data } = await axios.get(url, { timeout: 6000 });
    
    console.log("[API] News checked");

    if (data?.totalResults > 0) {
      // Find which keyword matched
      const firstArticle = data.articles[0].title.toLowerCase() + " " + data.articles[0].description?.toLowerCase();
      let matchedType = "strike";
      
      for (const kw of keywords) {
        if (firstArticle.includes(kw)) {
          matchedType = kw;
          break;
        }
      }

      return { detected: true, type: matchedType };
    }

    return { detected: false };
  } catch (error) {
    console.log("[API] News fallback used (Error)");
    return { detected: false };
  }
}

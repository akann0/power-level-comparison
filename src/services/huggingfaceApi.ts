import { Entity, AttributeScore } from '../types';

const HF_API_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

/* Attribute query templates for semantic matching */
const ATTRIBUTE_QUERIES: Record<string, string[]> = {
  strength: ['physical strength', 'powerful', 'muscular', 'strong', 'force'],
  speed: ['fast', 'quick', 'velocity', 'sprint', 'agile', 'reaction time'],
  intelligence: ['intelligent', 'smart', 'strategic', 'genius', 'educated'],
  durability: ['endurance', 'resilient', 'tough', 'stamina', 'durable'],
  influence: ['influential', 'famous', 'impact', 'followers', 'legacy'],
};

/* Calls Hugging Face API to get text embeddings */
export async function getEmbeddings(texts: string[], apiKey: string): Promise<number[][]> {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: texts, options: { wait_for_model: true } }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  return response.json();
}

/* Calculates cosine similarity between two embedding vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* Splits text into manageable chunks for embedding */
function chunkText(text: string, maxLength: number = 500): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxLength) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += '. ' + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  
  return chunks.slice(0, 10); // Limit chunks to avoid API overload
}

/* Analyzes entity using BERT embeddings for semantic attribute scoring */
export async function analyzeWithBERT(
  entity: Entity, 
  apiKey: string
): Promise<Record<string, { score: number; confidence: number; evidence: string }>> {
  const text = entity.fullContent || entity.extract || '';
  const chunks = chunkText(text);
  
  if (chunks.length === 0) {
    return {};
  }

  const results: Record<string, { score: number; confidence: number; evidence: string }> = {};
  
  for (const [attribute, queries] of Object.entries(ATTRIBUTE_QUERIES)) {
    const allTexts = [...queries, ...chunks];
    const embeddings = await getEmbeddings(allTexts, apiKey);
    
    const queryEmbeddings = embeddings.slice(0, queries.length);
    const chunkEmbeddings = embeddings.slice(queries.length);
    
    let maxSimilarity = 0;
    let bestEvidence = '';
    
    for (let i = 0; i < chunkEmbeddings.length; i++) {
      for (const queryEmb of queryEmbeddings) {
        const sim = cosineSimilarity(queryEmb, chunkEmbeddings[i]);
        if (sim > maxSimilarity) {
          maxSimilarity = sim;
          bestEvidence = chunks[i];
        }
      }
    }
    
    results[attribute] = {
      score: Math.round(maxSimilarity * 100),
      confidence: Math.min(0.9, maxSimilarity + 0.2),
      evidence: bestEvidence.substring(0, 200),
    };
  }
  
  return results;
}

/* Enhanced attribute extraction combining basic + BERT analysis */
export async function enhanceAttributesWithBERT(
  attributes: AttributeScore[],
  entityA: Entity,
  entityB: Entity,
  apiKey: string
): Promise<AttributeScore[]> {
  try {
    const [analysisA, analysisB] = await Promise.all([
      analyzeWithBERT(entityA, apiKey),
      analyzeWithBERT(entityB, apiKey),
    ]);

    // Add BERT-derived attributes
    const bertAttributes: AttributeScore[] = [
      {
        name: 'Strength',
        category: 'physical',
        scoreA: analysisA.strength?.score || 50,
        scoreB: analysisB.strength?.score || 50,
        confidenceA: analysisA.strength?.confidence || 0.3,
        confidenceB: analysisB.strength?.confidence || 0.3,
        evidenceA: analysisA.strength?.evidence,
        evidenceB: analysisB.strength?.evidence,
      },
      {
        name: 'Speed',
        category: 'physical',
        scoreA: analysisA.speed?.score || 50,
        scoreB: analysisB.speed?.score || 50,
        confidenceA: analysisA.speed?.confidence || 0.3,
        confidenceB: analysisB.speed?.confidence || 0.3,
        evidenceA: analysisA.speed?.evidence,
        evidenceB: analysisB.speed?.evidence,
      },
      {
        name: 'Intelligence',
        category: 'mental',
        scoreA: analysisA.intelligence?.score || 50,
        scoreB: analysisB.intelligence?.score || 50,
        confidenceA: analysisA.intelligence?.confidence || 0.3,
        confidenceB: analysisB.intelligence?.confidence || 0.3,
        evidenceA: analysisA.intelligence?.evidence,
        evidenceB: analysisB.intelligence?.evidence,
      },
      {
        name: 'Influence',
        category: 'contextual',
        scoreA: analysisA.influence?.score || 50,
        scoreB: analysisB.influence?.score || 50,
        confidenceA: analysisA.influence?.confidence || 0.3,
        confidenceB: analysisB.influence?.confidence || 0.3,
        evidenceA: analysisA.influence?.evidence,
        evidenceB: analysisB.influence?.evidence,
      },
    ];

    return [...attributes, ...bertAttributes];
  } catch (error) {
    console.warn('BERT analysis failed, using basic attributes:', error);
    return attributes;
  }
}


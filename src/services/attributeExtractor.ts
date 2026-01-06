import { Entity, AttributeScore } from '../types';

/* Converts height to centimeters for normalization */
function normalizeHeight(value: number, unit: string): number {
  if (unit.includes('ft') || unit.includes("'") || unit.includes('feet')) {
    return value * 30.48;
  }
  if (unit.includes('m') && !unit.includes('cm')) {
    return value * 100;
  }
  return value;
}

/* Converts weight to kilograms for normalization */
function normalizeWeight(value: number, unit: string): number {
  if (unit.includes('lb') || unit.includes('pound')) {
    return value * 0.453592;
  }
  return value;
}

/* Calculates age from birth year */
function calculateAge(birthYear: number): number {
  return new Date().getFullYear() - birthYear;
}

/* Extracts height score from entity data */
function extractHeight(entity: Entity): { score: number; confidence: number; raw: string | null } {
  const sources = [entity.infobox?.height, entity.infobox?.size, entity.extract || ''];
  
  for (const source of sources) {
    if (!source) continue;
    const match = source.match(/(\d+(?:\.\d+)?)\s*(cm|m|ft|'|"|feet|inches)/i);
    if (match) {
      const value = normalizeHeight(parseFloat(match[1]), match[2]);
      const score = Math.min(100, Math.max(0, (value / 250) * 100));
      return { score, confidence: 0.9, raw: match[0] };
    }
  }
  
  return { score: 50, confidence: 0.2, raw: null };
}

/* Extracts weight score from entity data */
function extractWeight(entity: Entity): { score: number; confidence: number; raw: string | null } {
  const sources = [entity.infobox?.weight, entity.infobox?.mass, entity.extract || ''];
  
  for (const source of sources) {
    if (!source) continue;
    const match = source.match(/(\d+(?:\.\d+)?)\s*(kg|lbs?|pounds?|kilograms?)/i);
    if (match) {
      const value = normalizeWeight(parseFloat(match[1]), match[2]);
      const score = Math.min(100, Math.max(0, (value / 150) * 100));
      return { score, confidence: 0.9, raw: match[0] };
    }
  }
  
  return { score: 50, confidence: 0.2, raw: null };
}

/* Extracts age-based score from entity data */
function extractAge(entity: Entity): { score: number; confidence: number; raw: string | null } {
  const sources = [entity.infobox?.birth_date, entity.infobox?.born, entity.extract || ''];
  
  for (const source of sources) {
    if (!source) continue;
    const match = source.match(/(\d{4})/);
    if (match) {
      const birthYear = parseInt(match[1]);
      if (birthYear > 1800 && birthYear < new Date().getFullYear()) {
        const age = calculateAge(birthYear);
        const score = Math.min(100, Math.max(0, 100 - Math.abs(age - 30)));
        return { score, confidence: 0.95, raw: `Born ${birthYear} (Age ${age})` };
      }
    }
  }
  
  return { score: 50, confidence: 0.2, raw: null };
}

/* Counts achievement mentions in text */
function extractAchievements(entity: Entity): { score: number; confidence: number; raw: string | null } {
  const text = entity.extract || '';
  const achievementWords = ['champion', 'winner', 'award', 'medal', 'record', 'title', 'best'];
  
  let count = 0;
  for (const word of achievementWords) {
    const matches = text.toLowerCase().match(new RegExp(word, 'g'));
    count += matches?.length || 0;
  }
  
  const score = Math.min(100, count * 5);
  return { score, confidence: Math.min(0.8, count * 0.1), raw: `${count} achievement mentions` };
}

/* Analyzes text for experience indicators */
function extractExperience(entity: Entity): { score: number; confidence: number; raw: string | null } {
  const text = entity.extract || '';
  const match = text.match(/(\d+)\s*years?/i);
  
  if (match) {
    const years = parseInt(match[1]);
    const score = Math.min(100, years * 3);
    return { score, confidence: 0.7, raw: `${years} years` };
  }
  
  // Fallback: estimate from text length (more content = more notable)
  const score = Math.min(100, (text.length / 100));
  return { score, confidence: 0.3, raw: null };
}

/* Main function to extract all attributes for comparison */
export function extractAttributes(entityA: Entity, entityB: Entity): AttributeScore[] {
  const heightA = extractHeight(entityA);
  const heightB = extractHeight(entityB);
  const weightA = extractWeight(entityA);
  const weightB = extractWeight(entityB);
  const ageA = extractAge(entityA);
  const ageB = extractAge(entityB);
  const achievementsA = extractAchievements(entityA);
  const achievementsB = extractAchievements(entityB);
  const experienceA = extractExperience(entityA);
  const experienceB = extractExperience(entityB);

  return [
    {
      name: 'Height',
      category: 'physical',
      scoreA: heightA.score, scoreB: heightB.score,
      confidenceA: heightA.confidence, confidenceB: heightB.confidence,
      rawValueA: heightA.raw || undefined, rawValueB: heightB.raw || undefined,
    },
    {
      name: 'Weight',
      category: 'physical',
      scoreA: weightA.score, scoreB: weightB.score,
      confidenceA: weightA.confidence, confidenceB: weightB.confidence,
      rawValueA: weightA.raw || undefined, rawValueB: weightB.raw || undefined,
    },
    {
      name: 'Prime Age',
      category: 'physical',
      scoreA: ageA.score, scoreB: ageB.score,
      confidenceA: ageA.confidence, confidenceB: ageB.confidence,
      rawValueA: ageA.raw || undefined, rawValueB: ageB.raw || undefined,
    },
    {
      name: 'Achievements',
      category: 'contextual',
      scoreA: achievementsA.score, scoreB: achievementsB.score,
      confidenceA: achievementsA.confidence, confidenceB: achievementsB.confidence,
      rawValueA: achievementsA.raw || undefined, rawValueB: achievementsB.raw || undefined,
    },
    {
      name: 'Experience',
      category: 'mental',
      scoreA: experienceA.score, scoreB: experienceB.score,
      confidenceA: experienceA.confidence, confidenceB: experienceB.confidence,
      rawValueA: experienceA.raw || undefined, rawValueB: experienceB.raw || undefined,
    },
  ];
}

/* Calculates overall power level score from attributes */
export function calculateOverallScore(attributes: AttributeScore[]): { scoreA: number; scoreB: number } {
  let totalA = 0, totalB = 0, totalWeight = 0;
  
  for (const attr of attributes) {
    const weight = (attr.confidenceA + attr.confidenceB) / 2;
    totalA += attr.scoreA * weight;
    totalB += attr.scoreB * weight;
    totalWeight += weight;
  }
  
  return {
    scoreA: Math.round(totalA / totalWeight),
    scoreB: Math.round(totalB / totalWeight),
  };
}


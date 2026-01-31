import os
from datetime import datetime, timedelta
from typing import Dict, List

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

HF_URL = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2'
WIKI_API = 'https://en.wikipedia.org/w/api.php'
CACHE_TTL = timedelta(hours=24)
ATTRIBUTE_QUERIES = {
    'strength': ['physical strength', 'powerful', 'muscular'],
    'speed': ['fast', 'agile', 'quick'],
    'intelligence': ['strategic', 'intelligent', 'educated'],
    'influence': ['impact', 'legacy', 'famous'],
}

class CompareRequest(BaseModel):
    page_a: int
    page_b: int

class AttributeResult(BaseModel):
    score: int
    confidence: float
    evidence: str

app = FastAPI()
page_cache: Dict[int, Dict] = {}

# Fetches raw extract and infobox for a page.
def fetch_wikipedia_page(page_id: int) -> Dict:
    params = {
        'action': 'query',
        'format': 'json',
        'origin': '*',
        'pageids': str(page_id),
        'prop': 'extracts|revisions',
        'exintro': '0',
        'explaintext': '1',
        'rvprop': 'content',
        'rvslots': 'main',
    }
    resp = requests.get(WIKI_API, params=params, timeout=10)
    resp.raise_for_status()
    page = resp.json().get('query', {}).get('pages', {}).get(str(page_id), {})
    extract = page.get('extract', '')
    revisions = page.get('revisions', [{}])
    wikitext = revisions[0].get('slots', {}).get('main', {}).get('*', '')
    return {'extract': extract, 'wikitext': wikitext}

# Cleans and chunks text into sentence batches.
def chunk_text(text: str, max_length: int = 500) -> List[str]:
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    chunks: List[str] = []
    current = ''
    for sentence in sentences:
        if len(current) + len(sentence) > max_length:
            if current:
                chunks.append(current.strip())
            current = sentence
        else:
            current = f'{current}. {sentence}' if current else sentence
    if current:
        chunks.append(current.strip())
    return chunks[:10]

# Calls Hugging Face to get embeddings for supplied texts.
def get_embeddings(texts: List[str]) -> List[List[float]]:
    token = os.getenv('HF_API_TOKEN')
    if not token:
        raise RuntimeError('Missing HF_API_TOKEN')
    resp = requests.post(
        HF_URL,
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
        json={'inputs': texts, 'options': {'wait_for_model': True}},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()

# Computes cosine similarity between two vectors.
def cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0

# Returns or refreshes cached page data.
def get_cached_page(page_id: int) -> Dict:
    entry = page_cache.get(page_id)
    if entry and datetime.utcnow() - entry['fetched'] < CACHE_TTL:
        return entry['data']
    data = fetch_wikipedia_page(page_id)
    page_cache[page_id] = {'data': data, 'fetched': datetime.utcnow()}
    return data


# Computes semantic attribute scores given two extracts.
def score_attributes(extracts: List[str]) -> Dict[str, AttributeResult]:
    results: Dict[str, AttributeResult] = {}
    for attr, queries in ATTRIBUTE_QUERIES.items():
        combined = queries + chunk_text(extracts[0]) + chunk_text(extracts[1])
        embeddings = get_embeddings(combined)
        query_embs = embeddings[:len(queries)]
        chunk_embs = embeddings[len(queries):]
        max_sim, evidence = 0.0, ''
        for idx, chunk_emb in enumerate(chunk_embs):
            for query_emb in query_embs:
                sim = cosine_similarity(query_emb, chunk_emb)
                if sim > max_sim:
                    max_sim, evidence = sim, combined[len(queries) + idx]
        results[attr] = AttributeResult(
            score=int(max_sim * 100),
            confidence=min(0.9, max_sim + 0.2),
            evidence=evidence[:200],
        )
    return results

# Handles the /compare request and returns attribute scores.
@app.post('/compare')
def compare(request: CompareRequest) -> Dict[str, AttributeResult]:
    try:
        pages = [get_cached_page(request.page_a), get_cached_page(request.page_b)]
    except requests.HTTPError as err:
        raise HTTPException(status_code=502, detail=str(err))
    extracts = [pages[0]['extract'], pages[1]['extract']]
    return score_attributes(extracts)

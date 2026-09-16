const TAXONOMY_SOURCE = 
    "/MUHAMMAD-FATHI-DURAINI-BIN-SAHAIMI/data/taxonomy.json";
let taxonomyCache = null;

export async function loadTaxonomy() {
    if (taxonomyCache) {
        return taxonomyCache;
    }

    const response = await fetch(TAXONOMY_SOURCE);

    if (!response.ok) {
        throw new Error(
            `Unable to load ${TAXONOMY_SOURCE}: ${response.status}`
        );
    }

    taxonomyCache = await response.json();

    return taxonomyCache;
}

export function findConcept(taxonomy, id) {
    return (taxonomy.concepts ?? [])
        .find(item => item.id === id) ?? null;
}

export function findTopic(taxonomy, id) {
    return (taxonomy.topics ?? [])
        .find(item => item.id === id) ?? null;
}

export function findActor(taxonomy, id) {
    return (taxonomy.actors ?? [])
        .find(item => item.id === id) ?? null;
}

export function findLegalInstrument(taxonomy, id) {
    return (taxonomy.legal_instruments ?? [])
        .find(item => item.id === id) ?? null;
}

export function getRelationships(taxonomy, entityId) {
    return (taxonomy.relationships ?? [])
        .filter(
            relationship =>
                relationship.source === entityId ||
                relationship.target === entityId
        );
}

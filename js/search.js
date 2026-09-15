const SEARCH_WEIGHTS = {
    title: 8,
    keywords: 6,
    topics: 5,
    category: 4,
    description: 2,
    author: 2,
    type: 2,
    language: 1
};

export function normalizeText(value) {
    return String(value ?? "")
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function searchableValues(material) {
    return {
        title: normalizeText(material.title),
        keywords: normalizeText(
            (material.keywords ?? []).join(" ")
        ),
        topics: normalizeText(
            (material.topics ?? []).join(" ")
        ),
        category: normalizeText(material.category),
        description: normalizeText(material.description),
        author: normalizeText(material.author),
        type: normalizeText(material.type),
        language: normalizeText(material.language)
    };
}

function scoreMaterial(material, query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return 0;
    }

    const fields = searchableValues(material);
    const tokens = normalizedQuery.split(" ");

    let score = 0;

    for (const token of tokens) {
        for (const [field, weight] of Object.entries(
            SEARCH_WEIGHTS
        )) {
            const value = fields[field];

            if (!value) continue;

            if (value === token) {
                score += weight * 3;
            } else if (value.startsWith(token)) {
                score += weight * 2;
            } else if (value.includes(token)) {
                score += weight;
            }
        }
    }

    return score;
}

export function searchMaterials(materials, query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return materials.map(material => ({
            material,
            score: 0
        }));
    }

    return materials
        .map(material => ({
            material,
            score: scoreMaterial(
                material,
                normalizedQuery
            )
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return String(a.material.title)
                .localeCompare(
                    String(b.material.title)
                );
        });
}

export function filterMaterials(materials, filters = {}) {
    return materials.filter(material => {

        if (
            filters.category &&
            material.category !== filters.category
        ) {
            return false;
        }

        if (
            filters.type &&
            material.type !== filters.type
        ) {
            return false;
        }

        if (
            filters.language &&
            material.language !== filters.language
        ) {
            return false;
        }

        if (
            filters.year &&
            String(material.year) !== String(filters.year)
        ) {
            return false;
        }

        return true;
    });
}

export function sortMaterials(results, sort = "relevance") {
    const output = [...results];

    if (sort === "newest") {
        return output.sort(
            (a, b) =>
                Number(b.material.year) -
                Number(a.material.year)
        );
    }

    if (sort === "title") {
        return output.sort((a, b) =>
            String(a.material.title).localeCompare(
                String(b.material.title)
            )
        );
    }

    return output.sort(
        (a, b) => b.score - a.score
    );
}

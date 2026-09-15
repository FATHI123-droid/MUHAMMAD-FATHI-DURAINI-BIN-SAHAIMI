export function validateMaterial(material, taxonomy) {
    const errors = [];

    const conceptIds = new Set(
        (taxonomy.concepts ?? []).map(item => item.id)
    );

    const topicIds = new Set(
        (taxonomy.topics ?? []).map(item => item.id)
    );

    if (
        material.categoryId &&
        !conceptIds.has(material.categoryId)
    ) {
        errors.push(
            `Unknown categoryId: ${material.categoryId}`
        );
    }

    for (const topicId of material.topicIds ?? []) {
        if (!topicIds.has(topicId)) {
            errors.push(
                `Unknown topicId: ${topicId}`
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function validateTaxonomy(taxonomy) {
    const errors = [];

    const collections = [
        ["concepts", taxonomy.concepts],
        ["topics", taxonomy.topics],
        ["actors", taxonomy.actors],
        ["legal_instruments", taxonomy.legal_instruments]
    ];

    for (const [name, items] of collections) {
        const ids = new Set();

        for (const item of items ?? []) {
            if (!item.id) {
                errors.push(
                    `${name}: item is missing an id`
                );
                continue;
            }

            if (ids.has(item.id)) {
                errors.push(
                    `${name}: duplicate id ${item.id}`
                );
            }

            ids.add(item.id);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

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
    export function validateKnowledgeObject(material) {
    const errors = [];

    const requiredFields = [
        "id",
        "title",
        "description",
        "author",
        "year",
        "category",
        "categoryId",
        "topics",
        "topicIds",
        "type",
        "format",
        "language",
        "keywords",
        "version",
        "status"
    ];

    for (const field of requiredFields) {
        if (
            material[field] === undefined ||
            material[field] === null ||
            material[field] === ""
        ) {
            errors.push(
                `Missing required field: ${field}`
            );
        }
    }

    if (!Array.isArray(material.topics)) {
        errors.push(
            "topics must be an array"
        );
    }

    if (!Array.isArray(material.topicIds)) {
        errors.push(
            "topicIds must be an array"
        );
    }

    if (!Array.isArray(material.keywords)) {
        errors.push(
            "keywords must be an array"
        );
    }

    if (
        material.provenance &&
        typeof material.provenance !== "object"
    ) {
        errors.push(
            "provenance must be an object"
        );
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
}

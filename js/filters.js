export function getFilterOptions(materials) {
    return {
        categories: uniqueValues(
            materials.map(material => material.category)
        ),

        types: uniqueValues(
            materials.map(material => material.type)
        ),

        languages: uniqueValues(
            materials.map(material => material.language)
        ),

        years: uniqueValues(
            materials.map(material => material.year)
        ).sort((a, b) => Number(b) - Number(a))
    };
}

function uniqueValues(values) {
    return [...new Set(
        values.filter(
            value =>
                value !== undefined &&
                value !== null &&
                value !== ""
        )
    )];
}

export function readURLFilters() {
    const params = new URLSearchParams(
        window.location.search
    );

    return {
        search: params.get("search") ?? "",
        category: params.get("category") ?? "",
        type: params.get("type") ?? "",
        language: params.get("language") ?? "",
        year: params.get("year") ?? "",
        sort: params.get("sort") ?? "relevance"
    };
}

export function updateURL(filters) {
    const params = new URLSearchParams();

    const entries = [
        ["search", filters.search],
        ["category", filters.category],
        ["type", filters.type],
        ["language", filters.language],
        ["year", filters.year],
        ["sort", filters.sort]
    ];

    for (const [key, value] of entries) {
        if (value) {
            params.set(key, value);
        }
    }

    const queryString = params.toString();

    const newURL =
        queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

    window.history.replaceState(
        {},
        "",
        newURL
    );
}

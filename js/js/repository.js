import {
    searchMaterials,
    filterMaterials,
    sortMaterials
} from "./search.js";

import {
    getFilterOptions,
    readURLFilters,
    updateURL
} from "./filters.js";


const DATA_SOURCES = {
    materials: "data/materials.json",
    taxonomy: "data/taxonomy.json"
};


const state = {
    materials: [],
    filters: readURLFilters()
};


document.addEventListener(
    "DOMContentLoaded",
    boot
);


async function boot() {

    try {

        state.materials =
            await loadMaterials();

        initialiseFilters();

        applyURLState();

        renderRepository();

        bindEvents();

    } catch (error) {

        console.error(
            "Repository initialisation failed:",
            error
        );

        showError();

    }

}


async function loadRepositoryData() {

    const [
        materialsResponse,
        taxonomyResponse
    ] = await Promise.all([
        fetch(DATA_SOURCES.materials),
        fetch(DATA_SOURCES.taxonomy)
    ]);

    if (!materialsResponse.ok) {
        throw new Error(
            `Unable to load ${DATA_SOURCES.materials}`
        );
    }

    if (!taxonomyResponse.ok) {
        throw new Error(
            `Unable to load ${DATA_SOURCES.taxonomy}`
        );
    }

    const materialsData =
        await materialsResponse.json();

    const taxonomyData =
        await taxonomyResponse.json();

    return {
        materials:
            materialsData.materials ?? [],

        taxonomy:
            taxonomyData ?? {}
    };
}

    if (!response.ok) {

        throw new Error(
            `Unable to load ${DATA_SOURCE}`
        );

    }

    const data =
        await response.json();

    return data.materials ?? [];

}


function initialiseFilters() {

    const options =
        getFilterOptions(
            state.materials
        );


    populateSelect(
        "category",
        options.categories
    );


    populateSelect(
        "type",
        options.types
    );


    populateSelect(
        "language",
        options.languages
    );


    populateSelect(
        "year",
        options.years
    );

}


function populateSelect(
    filterName,
    values
) {

    const select =
        document.querySelector(
            `[data-filter="${filterName}"]`
        );

    if (!select) return;


    for (const value of values) {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    }

}


function applyURLState() {

    const searchInput =
        document.querySelector(
            "[data-search]"
        );

    if (searchInput) {

        searchInput.value =
            state.filters.search;

    }


    for (const [
        key,
        value
    ] of Object.entries(
        state.filters
    )) {

        const element =
            document.querySelector(
                `[data-filter="${key}"]`
            );

        if (element && value) {

            element.value = value;

        }

    }

}


function bindEvents() {

    const searchInput =
        document.querySelector(
            "[data-search]"
        );


    let searchTimer;


    searchInput?.addEventListener(
        "input",
        event => {

            clearTimeout(searchTimer);


            searchTimer =
                setTimeout(() => {

                    state.filters.search =
                        event.target.value.trim();

                    updateURL(
                        state.filters
                    );

                    renderRepository();

                }, 180);

        }
    );


    document
        .querySelectorAll(
            "[data-filter]"
        )
        .forEach(element => {

            element.addEventListener(
                "change",
                event => {

                    const key =
                        event.target.dataset.filter;

                    state.filters[key] =
                        event.target.value;

                    updateURL(
                        state.filters
                    );

                    renderRepository();

                }
            );

        });

}


function renderRepository() {

    let results =
        searchMaterials(
            state.materials,
            state.filters.search
        );


    let filtered =
        filterMaterials(
            results.map(
                result => result.material
            ),
            state.filters
        );


    const scoreMap =
        new Map(
            results.map(result => [
                result.material.id,
                result.score
            ])
        );


    results =
        filtered.map(material => ({
            material,
            score:
                scoreMap.get(material.id) ?? 0
        }));


    results =
        sortMaterials(
            results,
            state.filters.sort
        );


    renderResults(results);

}


function renderResults(results) {

    const container =
        document.querySelector(
            "[data-repository-results]"
        );

    const status =
        document.querySelector(
            "[data-result-count]"
        );


    if (!container) return;


    if (status) {

        status.textContent =
            `${results.length} ${
                results.length === 1
                    ? "material"
                    : "materials"
            } found`;

    }


    if (!results.length) {

        container.innerHTML = `
            <div class="material-card">

                <h2>
                    No materials found
                </h2>

                <p>
                    Try another search term or adjust
                    the repository filters.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        results
            .map(
                result =>
                    createMaterialCard(
                        result.material
                    )
            )
            .join("");

}


function createMaterialCard(material) {

    const tags =
        (material.topics ?? [])
            .map(topic => `
                <span class="material-tag">
                    ${escapeHTML(topic)}
                </span>
            `)
            .join("");


    const materialLink =
        material.page ?? material.file;


    const linkText =
        material.page
            ? "View Material"
            : "Open Material";


    return `
        <article class="material-card">

            <span class="material-tag">
                ${escapeHTML(
                    material.category
                )}
            </span>

            <h2>
                ${escapeHTML(
                    material.title
                )}
            </h2>

            <p>
                ${escapeHTML(
                    material.description
                )}
            </p>

            <div class="cluster">
                ${tags}
            </div>

            <p class="text-muted">
                ${escapeHTML(
                    material.type
                )}
                ·
                ${escapeHTML(
                    material.language
                )}
                ·
                ${escapeHTML(
                    material.year
                )}
            </p>

            <a
                href="${encodeURI(
                    materialLink
                )}"
                class="button button-primary"
            >
                ${linkText}
            </a>

        </article>
    `;

}


function showError() {

    const container =
        document.querySelector(
            "[data-repository-results]"
        );

    if (!container) return;

    container.innerHTML = `
        <div class="material-card">

            <h2>
                Repository unavailable
            </h2>

            <p>
                The repository data could not be loaded.
                Please try again later.
            </p>

        </div>
    `;

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

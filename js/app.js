const DATA_SOURCES = {
    materials: "data/materials.json",
    categories: "data/categories.json"
};

const state = {
    materials: [],
    categories: []
};

document.addEventListener("DOMContentLoaded", boot);

async function boot() {
    try {
        await loadRepositoryData();

        renderKnowledgeDomains();
        renderLatestMaterials();

        console.info(
            "Fathi Academic Knowledge Archive initialized."
        );
    } catch (error) {
        console.error(
            "Failed to initialise repository:",
            error
        );
    }
}

async function loadJSON(source) {
    const response = await fetch(source);

    if (!response.ok) {
        throw new Error(
            `Unable to load ${source}: ${response.status}`
        );
    }

    return response.json();
}

async function loadRepositoryData() {
    const [materialsData, categoriesData] =
        await Promise.all([
            loadJSON(DATA_SOURCES.materials),
            loadJSON(DATA_SOURCES.categories)
        ]);

    state.materials =
        materialsData.materials ?? [];

    state.categories =
        categoriesData.categories ?? [];
}

function renderKnowledgeDomains() {
    const container =
        document.querySelector(
            "[data-knowledge-domains]"
        );

    if (!container) return;

    container.innerHTML =
        state.categories
            .map(category => `
                <article class="knowledge-card">

                    <h3>
                        ${escapeHTML(category.name)}
                    </h3>

                    <p class="text-muted">
                        ${escapeHTML(
                            category.description
                        )}
                    </p>

                    <a
                        href="repository.html?category=${encodeURIComponent(
                            category.id
                        )}"
                        class="button button-primary"
                    >
                        Explore
                    </a>

                </article>
            `)
            .join("");
}

function renderLatestMaterials() {
    const container =
        document.querySelector(
            "[data-materials]"
        );

    if (!container) return;

    const latest =
        [...state.materials]
            .sort(
                (a, b) =>
                    Number(b.year) -
                    Number(a.year)
            )
            .slice(0, 6);

    container.innerHTML =
        latest
            .map(createMaterialCard)
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

            <h3>
                ${escapeHTML(
                    material.title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    material.description
                )}
            </p>

            <div class="cluster">
                ${tags}
            </div>

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

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

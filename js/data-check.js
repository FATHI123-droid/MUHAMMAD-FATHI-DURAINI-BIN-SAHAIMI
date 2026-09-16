import { loadTaxonomy } from "./taxonomy.js";

import {
    validateMaterial,
    validateTaxonomy
} from "./taxonomy-validator.js";


const MATERIALS_SOURCE =
    "../data/materials.json";


document.addEventListener(
    "DOMContentLoaded",
    runValidation
);


async function runValidation() {

    const status =
        document.querySelector(
            "#validation-status"
        );

    try {

        const [
            materialsData,
            taxonomy
        ] = await Promise.all([

            fetch(MATERIALS_SOURCE)
                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            "Unable to load materials.json"
                        );
                    }

                    return response.json();
                }),

            loadTaxonomy()

        ]);


        const taxonomyResult =
            validateTaxonomy(taxonomy);


        const materialResults =
            (materialsData.materials ?? [])
                .map(material => ({
                    material,
                    result:
                        validateMaterial(
                            material,
                            taxonomy
                        )
                }));


        const materialErrors =
            materialResults.flatMap(
                ({ material, result }) =>
                    result.errors.map(
                        error =>
                            `${material.id}: ${error}`
                    )
            );


        const errors = [
            ...taxonomyResult.errors,
            ...materialErrors
        ];


        if (!errors.length) {

            status.innerHTML = `
                <h2>Validation passed</h2>

                <p>
                    All taxonomy and material references
                    are valid.
                </p>

                <p class="text-muted">
                    Materials checked:
                    ${materialsData.materials?.length ?? 0}
                </p>
            `;

            return;
        }


        status.innerHTML = `
            <h2>Validation failed</h2>

            <ul>
                ${errors
                    .map(
                        error =>
                            `<li>${escapeHTML(error)}</li>`
                    )
                    .join("")}
            </ul>
        `;

    } catch (error) {

        console.error(
            "Validation failed:",
            error
        );

        status.innerHTML = `
            <h2>Validation unavailable</h2>

            <p>
                ${escapeHTML(error.message)}
            </p>
        `;
    }

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

const {
  roleTaxonomy,
} = require(
  "../../data/roleTaxonomy"
);

const normalizeRole =
  (
    rawRole = ""
  ) => {

    const normalizedInput =
      rawRole
        .toLowerCase()
        .trim();

    for (
      const category in roleTaxonomy
    ) {

      const roles =
        roleTaxonomy[
          category
        ];

      for (
        const canonicalRole in roles
      ) {

        const aliases =
          roles[
            canonicalRole
          ];

        const found =
          aliases.some(
            (alias) =>
              normalizedInput.includes(
                alias
              )
          );

        if (found) {

          return {
            category,

            canonicalRole,
          };
        }
      }
    }

    /*
      FALLBACK
    */
    return {
      category:
        "other",

      canonicalRole:
        normalizedInput
          .replace(/\s+/g, "_"),
    };
  };

module.exports = {
  normalizeRole,
};
const roles =
  require(
    "../../data/roles/roles"
  );

const normalizeRole =
  (inputRole = "") => {

    /*
    SAFETY
    */

    if (
      !inputRole ||
      typeof inputRole !==
        "string"
    ) {

      return {
        canonicalRole: "other",
        displayName: "Other",
        category: "other",
        aliases: [],
      };
    }

    const normalizedInput = String(inputRole).toLowerCase().trim();

    /*
    DIRECT MATCH
    */

    const directMatch =
      roles.find(
        (role) =>
          role.canonicalRole ===
          normalizedInput
      );

    if (directMatch) {
      return directMatch;
    }

    /*
    ALIAS MATCH
    */

    const aliasMatch =
      roles.find(
        (role) =>
          role.aliases.some(
            (alias) =>
              normalizedInput.includes(
                alias.toLowerCase()
              )
          )
      );

    if (aliasMatch) {
      return aliasMatch;
    }

    /*
    FALLBACK
    */

    return {
      canonicalRole: "other",
      displayName: inputRole || "Other",
      category: "other",
      aliases: [],
    };
  };

module.exports = {
  normalizeRole,
};
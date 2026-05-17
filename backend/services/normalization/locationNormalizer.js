const {
  locationMap,
} = require(
  "../../data/locationMap"
);

const normalizeLocation =
  (
    rawLocation = ""
  ) => {

    const normalizedInput =
      rawLocation
        .toLowerCase()
        .trim();

    for (
      const canonicalLocation in locationMap
    ) {

      const aliases =
        locationMap[
          canonicalLocation
        ];

      const found =
        aliases.some(
          (alias) =>
            normalizedInput.includes(
              alias
            )
        );

      if (found) {

        return canonicalLocation;
      }
    }

    /*
      FALLBACK
    */
    return normalizedInput;
  };

module.exports = {
  normalizeLocation,
};
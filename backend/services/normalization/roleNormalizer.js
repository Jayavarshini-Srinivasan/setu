const roleNormalizationMap = {

  /*
    TRANSPORT
  */
  transport: {

    auto_driver: [

      "auto",

      "auto driver",

      "rickshaw",

      "share auto",
    ],

    cab_driver: [

      "cab",

      "taxi",

      "uber",

      "ola",

      "car driver",
    ],

    truck_driver: [

      "truck",

      "lorry",

      "heavy vehicle",

      "goods vehicle",
    ],

    delivery_rider: [

      "delivery",

      "delivery boy",

      "swiggy",

      "zomato",

      "bike delivery",
    ],

    bus_driver: [

      "bus",

      "school bus",
    ],
  },

  /*
    ELECTRICAL
  */
  electrical: {

    electrician: [

      "electrician",

      "wireman",

      "electrical",
    ],
  },

  /*
    WAREHOUSE
  */
  logistics: {

    warehouse_worker: [

      "warehouse",

      "picker",

      "loader",

      "packer",
    ],
  },

  /*
    CONSTRUCTION
  */
  construction: {

    construction_worker: [

      "construction",

      "site worker",

      "mason",
    ],
  },
};

/*
  NORMALIZE ROLE
*/
function normalizeRole(
  rawRole
) {

  if (!rawRole) {

    return {

      category:
        "general",

      canonicalRole:
        "",
    };
  }

  const lowerRole =
    rawRole.toLowerCase();

  /*
    LOOP CATEGORIES
  */
  for (
    const category
    in roleNormalizationMap
  ) {

    const roles =
      roleNormalizationMap[
        category
      ];

    /*
      LOOP ROLES
    */
    for (
      const canonicalRole
      in roles
    ) {

      const aliases =
        roles[
          canonicalRole
        ];

      /*
        MATCH
      */
      const matched =
        aliases.some(
          (alias) =>
            lowerRole.includes(
              alias
            )
        );

      if (matched) {

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
      "general",

    canonicalRole:
      lowerRole
        .replace(/\s+/g, "_"),
  };
}

module.exports = {
  normalizeRole,
};
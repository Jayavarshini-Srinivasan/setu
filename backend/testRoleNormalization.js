const {
  normalizeRole,
} = require(
  "./services/normalization/roleOntologyNormalizer"
);

console.log(
  "\nTEST 1"
);

console.log(
  normalizeRole(
    "lorry driver"
  )
);

console.log(
  "\nTEST 2"
);

console.log(
  normalizeRole(
    "react developer"
  )
);

console.log(
  "\nTEST 3"
);

console.log(
  normalizeRole(
    "electrician"
  )
);

console.log(
  "\nTEST 4"
);

console.log(
  normalizeRole(
    "unknown role"
  )
);
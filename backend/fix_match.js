const fs = require("fs");

const controllerPath = "e:/projects/setu/backend/controllers/matchController.js";
let controller = fs.readFileSync(controllerPath, "utf8");
controller = controller.replace(/return isCorrectCategory && isRoleMatch;/g, "return isCorrectCategory;");
fs.writeFileSync(controllerPath, controller, "utf8");

const servicePath = "e:/projects/setu/backend/services/matchService.js";
let service = fs.readFileSync(servicePath, "utf8");
service = service.replace(/if \(roleMatch.compatibility === "weak" && skillOverlapPercentage === 0\) \{\s+return null;\s+\}/, "// if (roleMatch.compatibility === \"weak\" && skillOverlapPercentage === 0) return null;");
fs.writeFileSync(servicePath, service, "utf8");


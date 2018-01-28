const bindings = require("bindings");
const random = bindings("random.node");
delete random.path;
module.exports = {
    random
};
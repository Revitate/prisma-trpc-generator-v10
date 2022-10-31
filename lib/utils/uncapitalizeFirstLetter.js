"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalizeFirstLetter = exports.uncapitalizeFirstLetter = void 0;
const uncapitalizeFirstLetter = (str) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
};
exports.uncapitalizeFirstLetter = uncapitalizeFirstLetter;
const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
exports.capitalizeFirstLetter = capitalizeFirstLetter;
//# sourceMappingURL=uncapitalizeFirstLetter.js.map
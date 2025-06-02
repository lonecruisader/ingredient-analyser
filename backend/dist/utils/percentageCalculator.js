"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePercentages = calculatePercentages;
function calculatePercentages(classification) {
    const total = classification.length;
    const naturalCount = classification.filter(([_, type]) => type === 'natural').length;
    const syntheticCount = classification.filter(([_, type]) => type === 'synthetic').length;
    return {
        natural: (naturalCount / total) * 100,
        synthetic: (syntheticCount / total) * 100
    };
}

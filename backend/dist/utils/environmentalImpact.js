"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentalImpactAnalyzer = void 0;
const llm_1 = require("../services/llm");
class EnvironmentalImpactAnalyzer {
    constructor() {
        this.llmService = llm_1.LLMService.getInstance();
    }
    static getInstance() {
        if (!EnvironmentalImpactAnalyzer.instance) {
            EnvironmentalImpactAnalyzer.instance = new EnvironmentalImpactAnalyzer();
        }
        return EnvironmentalImpactAnalyzer.instance;
    }
    async analyzeEnvironmentalImpact(ingredients) {
        try {
            const response = await this.llmService.analyzeEnvironmentalImpact(ingredients);
            return response;
        }
        catch (error) {
            console.error('Error analyzing environmental impact:', error);
            throw new Error('Failed to analyze environmental impact');
        }
    }
    calculateOverallImpact(analyses) {
        const impactScores = {
            biodegradability: { high: 3, medium: 2, low: 1 },
            toxicity: { low: 3, moderate: 2, high: 1 },
            sustainability: { sustainable: 3, moderate: 2, unsustainable: 1 }
        };
        const scores = analyses.map(analysis => ({
            biodegradability: impactScores.biodegradability[analysis.impact.biodegradability],
            toxicity: impactScores.toxicity[analysis.impact.toxicity],
            sustainability: impactScores.sustainability[analysis.impact.sustainability]
        }));
        const total = scores.length;
        const averages = {
            averageBiodegradability: scores.reduce((sum, score) => sum + score.biodegradability, 0) / total,
            averageToxicity: scores.reduce((sum, score) => sum + score.toxicity, 0) / total,
            averageSustainability: scores.reduce((sum, score) => sum + score.sustainability, 0) / total
        };
        // Calculate overall score (weighted average)
        const overallScore = (averages.averageBiodegradability * 0.4 +
            averages.averageToxicity * 0.3 +
            averages.averageSustainability * 0.3);
        return {
            ...averages,
            overallScore
        };
    }
}
exports.EnvironmentalImpactAnalyzer = EnvironmentalImpactAnalyzer;

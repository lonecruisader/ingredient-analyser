import React from 'react';
import { Product } from '../types';
import './IngredientAnalysis.css';

interface IngredientAnalysisProps {
  product?: Product;
}

const IngredientAnalysis: React.FC<IngredientAnalysisProps> = ({ product }) => {
  if (!product) {
    return (
      <div className="analysis-container" role="region" aria-label="Ingredient Analysis">
        <div className="no-data-message" role="status">
          Search for a product to see ingredient analysis
        </div>
      </div>
    );
  }

  const { name, ingredientAnalysis } = product;
  
  if (!ingredientAnalysis) {
    return (
      <div className="analysis-container" role="region" aria-label="Ingredient Analysis">
        <div className="no-data-message" role="status">
          No ingredient analysis available for {name}
        </div>
      </div>
    );
  }

  const { classification, percentages } = ingredientAnalysis;

  return (
    <div className="analysis-container" role="region" aria-label="Ingredient Analysis">
      <div className="analysis-header">
        <h2 id="product-name">{name}</h2>
      </div>

      <div className="composition-section">
        <h3 id="composition-heading">Overall Composition</h3>
        <div 
          className="composition-chart" 
          role="img" 
          aria-label={`Composition chart showing ${percentages.natural.toFixed(1)}% natural and ${percentages.synthetic.toFixed(1)}% synthetic ingredients`}
        >
          <div className="chart-bar">
            <div 
              className="natural-bar" 
              style={{ width: `${percentages.natural}%` }}
              role="presentation"
            >
              <span>Natural ({percentages.natural.toFixed(1)}%)</span>
            </div>
            <div 
              className="synthetic-bar" 
              style={{ width: `${percentages.synthetic}%` }}
              role="presentation"
            >
              <span>Synthetic ({percentages.synthetic.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ingredients-section">
        <h3 id="ingredients-heading">Ingredient Breakdown</h3>
        <div 
          className="ingredients-list" 
          role="list" 
          aria-labelledby="ingredients-heading"
        >
          {classification.map(([ingredient, type], index) => (
            <div 
              key={index} 
              className="ingredient-item"
              role="listitem"
            >
              <div className="ingredient-header">
                <span className="ingredient-name">{ingredient}</span>
                <span 
                  className={`ingredient-type ${type.toLowerCase()}`}
                  aria-label={`${ingredient} is a ${type.toLowerCase()} ingredient`}
                >
                  {type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IngredientAnalysis; 
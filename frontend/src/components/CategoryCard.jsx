import React, { useState } from 'react'

export const CategoryCard = ({ category, onSelectSubProblem, onSelectCategory }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div
      className="civic-category-card"
      style={{
        '--cat-accent': category.color,
        '--cat-glow': category.bgGlow,
        '--cat-border': category.borderColor,
      }}
    >
      {/* Category Header */}
      <div className="cat-card-header">
        <div className="cat-header-main">
          <div className="cat-icon-container" style={{ background: category.bgGlow, borderColor: category.borderColor }}>
            <span className="cat-icon">{category.icon}</span>
          </div>
          <div>
            <div className="cat-title-row">
              <h3 className="cat-title">{category.title}</h3>
              <span className="cat-badge" style={{ color: category.color, background: category.bgGlow, borderColor: category.borderColor }}>
                {category.subProblems.length} Sub-issues
              </span>
            </div>
            <p className="cat-description">{category.description}</p>
          </div>
        </div>

        <button
          className="cat-report-btn"
          onClick={() => onSelectCategory && onSelectCategory(category.title)}
          title={`Report issue under ${category.title}`}
        >
          <span>Report {category.title}</span>
          <span className="cat-arrow">→</span>
        </button>
      </div>

      {/* Sub-Problems Visual Tree Hierarchy */}
      <div className="cat-subproblems-wrapper">
        <div className="cat-subproblems-header">
          <span className="tree-heading">Sub-problem Breakdown Hierarchy:</span>
          <button
            type="button"
            className="tree-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>

        {isExpanded && (
          <div className="cat-tree-view">
            <div className="tree-root-label">
              <span className="tree-folder-icon">📁</span>
              <strong>{category.title}</strong>
            </div>

            <div className="tree-branches">
              {category.subProblems.map((sub, idx) => {
                const isLast = idx === category.subProblems.length - 1
                const branchChar = isLast ? '└── ' : '├── '

                const getSeverityClass = (sev) => {
                  switch (sev) {
                    case 'Critical':
                      return 'sev-critical'
                    case 'High':
                      return 'sev-high'
                    case 'Medium':
                      return 'sev-medium'
                    default:
                      return 'sev-low'
                  }
                }

                return (
                  <div
                    key={sub.id || idx}
                    className="tree-node-row"
                    onClick={() => onSelectSubProblem && onSelectSubProblem(category.title, sub.name)}
                    title={`Click to report ${sub.name}`}
                  >
                    <span className="tree-branch-symbol">{branchChar}</span>
                    <span className="tree-node-name">{sub.name}</span>
                    <span className={`tree-sev-badge ${getSeverityClass(sub.severity)}`}>
                      {sub.severity}
                    </span>
                    <span className="tree-node-action">Click to Report ⚡</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

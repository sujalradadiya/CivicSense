/**
 * Rule-Based Complaint Priority Engine
 * Can be extended with AI / LLM classification in future iterations
 */
class PriorityService {
  static CRITICAL_KEYWORDS = [
    "emergency",
    "danger",
    "life threat",
    "live wire",
    "gas leak",
    "fire hazard",
    "bridge collapse",
    "explosion",
    "major accident",
    "flood",
    "sewage inside",
    "building collapse",
    "electrocution",
  ];

  static HIGH_KEYWORDS = [
    "large pothole",
    "deep pothole",
    "open manhole",
    "broken water main",
    "hospital road",
    "school zone",
    "traffic signal down",
    "water contamination",
    "dead animal",
    "heavy overflow",
    "cross road hazard",
  ];

  static LOW_KEYWORDS = [
    "inquiry",
    "poster",
    "minor noise",
    "tree trimming",
    "garden leaf",
    "feedback",
    "information request",
  ];

  /**
   * Determine rule-based priority from complaint attributes
   * @param {Object} complaint
   * @returns {string} LOW | MEDIUM | HIGH | CRITICAL
   */
  static evaluatePriority(complaint = {}) {
    // 1. If urgency is explicitly provided from frontend
    if (complaint.urgency) {
      const u = String(complaint.urgency).trim().toLowerCase();
      if (u === "critical") return "CRITICAL";
      if (u === "high") return "HIGH";
      if (u === "medium") return "MEDIUM";
      if (u === "low") return "LOW";
    }

    // 2. Combine searchable text fields
    const textCorpus = [
      complaint.issueTitle || complaint.category || "",
      complaint.issueDetails || complaint.description || "",
      complaint.subProblem || "",
      complaint.landmark || "",
    ]
      .join(" ")
      .toLowerCase();

    // 3. Check for Critical keywords
    for (const kw of this.CRITICAL_KEYWORDS) {
      if (textCorpus.includes(kw)) {
        return "CRITICAL";
      }
    }

    // 4. Check for High priority keywords or upvotes threshold
    for (const kw of this.HIGH_KEYWORDS) {
      if (textCorpus.includes(kw)) {
        return "HIGH";
      }
    }

    if (complaint.upvotes && Number(complaint.upvotes) >= 10) {
      return "HIGH";
    }

    // 5. Check for Low priority keywords
    for (const kw of this.LOW_KEYWORDS) {
      if (textCorpus.includes(kw)) {
        return "LOW";
      }
    }

    // 6. Default priority is MEDIUM
    return "MEDIUM";
  }
}

module.exports = PriorityService;

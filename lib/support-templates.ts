export interface SupportTemplate {
  id: string
  title: string
  category: string
  description: string
  tags: string[]
}

export const supportTemplates: SupportTemplate[] = [
  {
    id: "harassment-verbal",
    title: "Verbal Harassment Report",
    category: "harassment",
    description: `I would like to report an incident of verbal harassment that occurred on [DATE] at approximately [TIME].

The individual(s) involved: [NAMES OR DESCRIPTIONS]

Details of the incident:
- What was said
- Where it happened
- Who witnessed it

This behavior has affected my ability to [DESCRIBE IMPACT].

I have the following evidence to support my report: [DESCRIBE ANY EVIDENCE]`,
    tags: ["harassment", "verbal", "workplace"],
  },
  {
    id: "harassment-physical",
    title: "Physical Harassment Report",
    category: "harassment",
    description: `I need to report an incident of physical harassment that occurred on [DATE] at approximately [TIME].

The individual(s) involved: [NAMES OR DESCRIPTIONS]

Details of the incident:
- What happened
- Where it happened
- Who witnessed it

This incident has resulted in [DESCRIBE IMPACT/INJURIES IF ANY].

I have the following evidence to support my report: [DESCRIBE ANY EVIDENCE]`,
    tags: ["harassment", "physical", "safety"],
  },
  {
    id: "discrimination",
    title: "Discrimination Report",
    category: "discrimination",
    description: `I would like to report discrimination that I experienced/witnessed on [DATE].

Type of discrimination: [e.g., racial, gender, age, etc.]

The individual(s) involved: [NAMES OR DESCRIPTIONS]

Details of the incident:
- What happened
- Where it happened
- Pattern of behavior (if applicable)

This discrimination has affected [DESCRIBE IMPACT].

I have the following evidence to support my report: [DESCRIBE ANY EVIDENCE]`,
    tags: ["discrimination", "equality", "workplace"],
  },
  {
    id: "safety-concern",
    title: "Safety Concern Report",
    category: "safety",
    description: `I would like to report a safety concern that I observed on [DATE] at [LOCATION].

The safety issue involves: [BRIEF DESCRIPTION]

Details of the concern:
- What is the hazard
- Who is at risk
- How urgent is this issue

This safety issue could potentially result in [DESCRIBE POTENTIAL CONSEQUENCES].

I have the following evidence to document this concern: [DESCRIBE ANY EVIDENCE]`,
    tags: ["safety", "hazard", "risk"],
  },
  {
    id: "misconduct",
    title: "Professional Misconduct Report",
    category: "misconduct",
    description: `I need to report professional misconduct that occurred on [DATE].

The individual(s) involved: [NAMES OR DESCRIPTIONS]

Details of the misconduct:
- What happened
- Where it happened
- Who witnessed it
- Any policies or regulations violated

This misconduct has resulted in [DESCRIBE IMPACT].

I have the following evidence to support my report: [DESCRIBE ANY EVIDENCE]`,
    tags: ["misconduct", "professional", "ethics"],
  },
]

export function getTemplateById(id: string): SupportTemplate | undefined {
  return supportTemplates.find((template) => template.id === id)
}

export function getTemplatesByCategory(category: string): SupportTemplate[] {
  return supportTemplates.filter((template) => template.category === category)
}

export function getTemplatesByTags(tags: string[]): SupportTemplate[] {
  return supportTemplates.filter((template) => tags.some((tag) => template.tags.includes(tag)))
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const knowledgeBaseArticles: KnowledgeArticle[] = [
  {
    id: "harassment-policy",
    title: "Harassment Policy and Reporting Procedures",
    content: `# Harassment Policy and Reporting Procedures

## Our Commitment

The Sailor's Media Voyage is committed to providing a safe and respectful environment for all sailors. Harassment of any kind will not be tolerated.

## What Constitutes Harassment

Harassment includes, but is not limited to:

- Verbal abuse or offensive comments
- Unwelcome advances or propositions
- Physical contact without consent
- Intimidation or threats
- Persistent unwanted attention
- Discriminatory jokes or language
- Sharing of offensive images or materials

## Reporting Procedures

If you experience or witness harassment:

1. **Document the incident** - Note the date, time, location, and details of what occurred
2. **Report immediately** - Use the Support Request form to submit a detailed report
3. **Provide evidence** - If available, include any supporting evidence (messages, photos, videos)
4. **Specify witnesses** - Include names of any witnesses to the incident

## Confidentiality

All reports will be handled with the utmost confidentiality. You may choose to report anonymously if you prefer.

## Investigation Process

1. All reports will be reviewed promptly by ship's officers
2. Both parties will be interviewed separately
3. Witnesses may be consulted
4. Appropriate action will be taken based on findings
5. You will be notified of the outcome

## Protection Against Retaliation

Retaliation against anyone who reports harassment is strictly prohibited and will result in disciplinary action.

## Support Resources

- Ship's Counselor: Available 24/7 at extension 555
- Crew Wellness Center: Located on Deck 3, open 0800-2000 daily
- Emergency Assistance: Dial 911 from any ship phone`,
    category: "policies",
    tags: ["harassment", "policy", "reporting", "safety"],
    createdAt: "2023-01-15T08:00:00Z",
    updatedAt: "2023-06-22T14:30:00Z",
  },
  {
    id: "discrimination-guide",
    title: "Understanding and Addressing Discrimination",
    content: `# Understanding and Addressing Discrimination

## What is Discrimination?

Discrimination occurs when someone is treated unfairly or less favorably based on characteristics such as:

- Race or ethnicity
- Gender or gender identity
- Sexual orientation
- Age
- Disability
- Religion
- National origin

## Examples of Discrimination

- Denying opportunities based on protected characteristics
- Applying different standards to different groups
- Making decisions based on stereotypes rather than merit
- Exclusion from activities or groups
- Hostile or unwelcoming environment for certain individuals

## How to Address Discrimination

If you experience or witness discrimination:

1. **Speak up if safe** - If possible, calmly explain why the behavior is problematic
2. **Document everything** - Keep detailed records of incidents, including dates and witnesses
3. **Report through proper channels** - Submit a support request with all relevant details
4. **Seek support** - Connect with allies and support resources

## Our Anti-Discrimination Policy

The Sailor's Media Voyage prohibits discrimination in all forms. We are committed to:

- Equal opportunities for all sailors
- Diverse and inclusive environment
- Zero tolerance for discriminatory behavior
- Regular training and education
- Swift and appropriate response to reports

## Resources for Education

- Diversity and Inclusion Library: Located on Deck 4
- Monthly Workshops: Check the ship's calendar for schedule
- Online Courses: Available through the crew portal

Remember, creating an inclusive environment is everyone's responsibility.`,
    category: "guides",
    tags: ["discrimination", "equality", "diversity", "inclusion"],
    createdAt: "2023-02-10T10:15:00Z",
    updatedAt: "2023-07-05T09:45:00Z",
  },
  {
    id: "safety-guidelines",
    title: "Workplace Safety Guidelines and Best Practices",
    content: `# Workplace Safety Guidelines and Best Practices

## General Safety Principles

1. **Be aware of your surroundings** at all times
2. **Report hazards immediately** to your supervisor
3. **Follow all posted safety instructions** and warnings
4. **Use proper equipment** for each task
5. **Maintain clean and organized** work areas

## Common Hazards and Prevention

### Slips, Trips, and Falls
- Keep walkways clear of obstacles
- Clean up spills immediately
- Use handrails on stairs
- Wear appropriate footwear

### Equipment Safety
- Complete required training before operating equipment
- Inspect equipment before use
- Use all required safety guards and features
- Report malfunctions immediately

### Emergency Procedures
- Know the location of emergency exits
- Familiarize yourself with evacuation routes
- Understand how to use fire extinguishers
- Know where first aid kits are located

## Reporting Safety Concerns

If you identify a safety hazard:

1. Take immediate action to prevent harm if possible
2. Report the issue to your supervisor
3. Submit a detailed support request if the issue is not addressed
4. Include photos or videos of the hazard when possible

## Safety Resources

- Safety Officer: Located on Deck 2, Office 205
- Safety Training: Scheduled monthly, sign up through crew portal
- Emergency Procedures Manual: Available in all common areas

Remember: Safety is everyone's responsibility. If you see something, say something.`,
    category: "guides",
    tags: ["safety", "workplace", "hazards", "prevention"],
    createdAt: "2023-03-05T14:30:00Z",
    updatedAt: "2023-08-12T11:20:00Z",
  },
  {
    id: "conflict-resolution",
    title: "Conflict Resolution Techniques for Sailors",
    content: `# Conflict Resolution Techniques for Sailors

## Understanding Conflict

Conflict is a natural part of working and living in close quarters. The key is not to avoid all conflict, but to handle it constructively.

## Effective Communication Strategies

### Active Listening
- Give your full attention
- Don't interrupt
- Paraphrase to confirm understanding
- Ask clarifying questions

### "I" Statements
Instead of: "You always leave your things everywhere."
Try: "I feel frustrated when I find personal items in the shared space because it makes it difficult for me to use the area."

### Choosing the Right Time and Place
- Find a private, neutral location
- Ensure you both have enough time
- Avoid discussing when emotions are high

## Step-by-Step Conflict Resolution

1. **Identify the issue** - Focus on specific behaviors or situations, not personality
2. **Express your perspective** - Use "I" statements to share your feelings
3. **Listen to the other perspective** - Try to understand their point of view
4. **Brainstorm solutions together** - Generate multiple options
5. **Agree on a solution** - Find common ground and commit to it
6. **Follow up** - Check in later to see if the solution is working

## When to Seek Help

Some conflicts require additional support. Consider seeking help when:

- The conflict involves harassment or discrimination
- You've tried to resolve it directly without success
- The situation is affecting your wellbeing or job performance
- There's a significant power imbalance

## Resources Available

- Peer Mediators: Trained crew members available to facilitate discussions
- Ship's Counselor: Professional support for more complex situations
- Support Request System: For formal intervention when necessary

Remember that addressing conflicts early often prevents them from escalating into more serious issues.`,
    category: "guides",
    tags: ["conflict", "communication", "resolution", "mediation"],
    createdAt: "2023-04-18T09:45:00Z",
    updatedAt: "2023-09-03T16:10:00Z",
  },
  {
    id: "mental-health",
    title: "Mental Health Resources and Support at Sea",
    content: `# Mental Health Resources and Support at Sea

## Understanding Mental Health at Sea

Life at sea presents unique challenges that can impact mental wellbeing:
- Extended separation from loved ones
- Limited privacy and personal space
- Disrupted sleep patterns
- Potential isolation and monotony

## Recognizing Warning Signs

Pay attention to these potential indicators in yourself or crewmates:
- Persistent sadness or irritability
- Withdrawal from social activities
- Changes in sleep or appetite
- Difficulty concentrating
- Loss of interest in activities once enjoyed
- Increased use of alcohol or substances

## Self-Care Strategies

### Daily Practices
- Maintain a regular sleep schedule
- Eat nutritious meals
- Exercise regularly
- Stay hydrated
- Practice mindfulness or meditation
- Connect with others

### Setting Boundaries
- Take breaks when needed
- Establish a personal space
- Schedule time for activities you enjoy
- Limit news consumption if it causes distress

## Available Support Resources

### On Board
- Mental Health First Aiders: Identified by blue badges
- Ship's Counselor: Professional support available by appointment
- Peer Support Network: Fellow sailors trained in supportive listening
- Wellness Center: Offers meditation sessions and stress management workshops

### Digital Resources
- Telehealth Counseling: Available through the crew portal
- Mental Health Apps: Free access to premium versions of meditation and therapy apps
- Online Support Groups: Scheduled virtual meetings for various concerns

## Seeking Help

Reaching out for support is a sign of strength, not weakness. To access help:

1. Speak with your supervisor or the Ship's Counselor directly
2. Submit a confidential request through the crew portal
3. Contact the 24/7 Mental Health Hotline: Extension 777

All mental health services are confidential and protected by privacy policies.

Remember: Your mental health matters. You deserve support, and resources are available to help you thrive at sea.`,
    category: "resources",
    tags: ["mental health", "wellbeing", "support", "self-care"],
    createdAt: "2023-05-22T11:30:00Z",
    updatedAt: "2023-10-15T13:45:00Z",
  },
]

export function getArticleById(id: string): KnowledgeArticle | undefined {
  return knowledgeBaseArticles.find((article) => article.id === id)
}

export function getArticlesByCategory(category: string): KnowledgeArticle[] {
  return knowledgeBaseArticles.filter((article) => article.category === category)
}

export function getArticlesByTags(tags: string[]): KnowledgeArticle[] {
  return knowledgeBaseArticles.filter((article) => tags.some((tag) => article.tags.includes(tag)))
}

export function searchArticles(query: string): KnowledgeArticle[] {
  const lowercaseQuery = query.toLowerCase()
  return knowledgeBaseArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

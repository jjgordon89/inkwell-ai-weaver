import { AIAction, AIProvider } from './types';

export const getPromptForAction = (action: AIAction, text: string): string => {
  switch (action) {
    // General writing actions
    case 'improve':
      return `Please improve the following text by enhancing clarity, flow, and readability while maintaining the original meaning:\n\n${text}`;
    case 'shorten':
      return `Please make the following text more concise while preserving the key information and meaning:\n\n${text}`;
    case 'expand':
      return `Please expand the following text by adding relevant details, context, and depth while maintaining the original tone and meaning:\n\n${text}`;
    case 'fix-grammar':
      return `Please correct any grammar, punctuation, and spelling errors in the following text while maintaining its original meaning and tone:\n\n${text}`;
    case 'analyze-tone':
      return `Analyze the tone, mood, and style of the following text. Provide specific observations about the emotional resonance, voice, and narrative approach:\n\n${text}`;
    case 'generate-plot':
      return `Based on the following story context, generate creative plot elements, conflicts, and story developments:\n\n${text}`;
    case 'continue-story':
      return `Continue the following story naturally, maintaining the established tone, style, and narrative voice:\n\n${text}`;
    case 'writing-prompt':
      return `Create an engaging and creative writing prompt based on the following theme or context:\n\n${text}`;
    case 'context-suggestion':
      return `Provide contextual writing suggestions and improvements based on the following text:\n\n${text}`;
    case 'analyze-writing-quality':
      return `Analyze the following text for writing quality. Provide the analysis in the following key-value format.
ReadabilityScore: [a score from 0 to 100]
ReadabilityLevel: [a level like 'Excellent', 'Good', 'Fair', 'Needs Improvement']
ReadabilitySuggestions: [a bulleted list of 2-3 suggestions for readability, separated by newlines]
SentenceVariety: [a score from 0 to 100]
VocabularyRichness: [a score from 0 to 100]
Pacing: [a string like 'Slow', 'Moderate', 'Fast']
Engagement: [a score from 0 to 100]

Text to analyze:
${text}`;
    case 'predict-next-words':
      return `Based on the following text, predict the next 5 most likely words. Return them as a comma-separated list, without any other text:\n\n${text}`;
    
    // Academic writing actions
    case 'academic-thesis-statement':
      return `Based on the following academic text or topic, generate a clear, focused thesis statement that precisely states the main argument and scope. The thesis should be appropriately nuanced for academic writing, specific enough to be defended within a paper, and reflect scholarly standards:\n\n${text}`;
    case 'academic-literature-review':
      return `Based on the following academic context, generate a literature review section that synthesizes existing research, identifies key themes and gaps, and establishes the theoretical framework for this study. Format with proper academic citations and critical analysis of methodologies and findings:\n\n${text}`;
    case 'academic-abstract':
      return `Create a comprehensive academic abstract (200-250 words) for the following research. Include: research problem, methodology, key findings, and implications. Use formal academic language appropriate for scholarly publication:\n\n${text}`;
    case 'academic-research-question':
      return `Based on the following academic context, formulate 3-5 focused research questions that are specific, measurable, and aligned with academic inquiry standards. These questions should address identified gaps in the literature and be suitable for empirical investigation:\n\n${text}`;
    case 'academic-methodology':
      return `Based on the following research context, develop a methodology section that details research design, data collection methods, analytical approach, and addresses validity and reliability concerns. Include justification for methodological choices aligned with the research questions:\n\n${text}`;
    
    // Memoir writing actions
    case 'memoir-reflection':
      return `Based on the following memoir excerpt or memory, develop a reflective passage that explores the deeper significance of this experience, connecting it to broader themes in your life narrative. Include sensory details, emotional insights, and perspective shifts between past and present:\n\n${text}`;
    case 'memoir-timeline':
      return `Based on the following memoir content, create a chronological timeline of key life events, identifying 5-7 pivotal moments that shaped your journey. For each event, include approximate date, brief description, and emotional significance:\n\n${text}`;
    case 'memoir-character-sketch':
      return `Based on the following memoir context, create a nuanced character sketch of an important person in your life story. Include physical description, personality traits, your relationship dynamics, and how they influenced your development or perspective:\n\n${text}`;
    case 'memoir-setting-description':
      return `Based on the following memoir context, create a vivid description of a significant place from your life. Include sensory details (sights, sounds, smells), emotional associations, and how this environment shaped your experiences or identity:\n\n${text}`;
    case 'memoir-emotional-insight':
      return `Based on the following memoir excerpt, develop a passage that explores the emotional landscape of this experience. Analyze how you felt then versus now, what you've learned, and how this emotional journey connects to broader themes in your life story:\n\n${text}`;
    
    // Nonfiction writing actions
    case 'nonfiction-outline':
      return `Based on the following nonfiction topic or content, create a detailed chapter-by-chapter outline with subsections. Include key points to cover in each section, potential sources or examples, and a logical progression of ideas that builds your argument or narrative:\n\n${text}`;
    case 'nonfiction-research-summary':
      return `Based on the following nonfiction context, create a concise research summary that synthesizes key findings, identifies important sources, and highlights areas where additional research may be needed. Format with proper citations and emphasize the most relevant information for your topic:\n\n${text}`;
    case 'nonfiction-expert-interview':
      return `Based on the following nonfiction topic, generate 10 insightful interview questions for a subject matter expert. These questions should elicit specific information, expert opinions, and memorable quotes that would enhance your nonfiction narrative:\n\n${text}`;
    case 'nonfiction-fact-check':
      return `Review the following nonfiction content for factual accuracy. Identify any claims that require verification, suggest additional sources for fact-checking, and flag any statements that may need qualification or context to ensure journalistic integrity:\n\n${text}`;
    case 'nonfiction-conclusion':
      return `Based on the following nonfiction content, create a powerful conclusion that synthesizes key points, reinforces the main thesis, provides meaningful takeaways for readers, and suggests broader implications or applications of the information presented:\n\n${text}`;
    
    default:
      return text;
  }
};

export const performMockTextProcessing = async (text: string, action: AIAction, selectedModel: string): Promise<string> => {
  const processingTime = Math.random() * 2000 + 1000;
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  switch (action) {
    // General writing actions
    case 'improve':
      return `Enhanced version using ${selectedModel}: ${text.replace(/\b(good|nice|ok)\b/gi, 'excellent').replace(/\b(bad|poor)\b/gi, 'suboptimal')}`;
    case 'shorten': {
      const words = text.split(' ');
      const targetLength = Math.max(Math.floor(words.length * 0.7), 3);
      return words.slice(0, targetLength).join(' ') + (targetLength < words.length ? '...' : '');
    }
    case 'expand':
      return `${text} This expanded version provides additional context and detail, offering readers a more comprehensive understanding of the topic while maintaining the original meaning and intent.`;
    case 'fix-grammar':
      return text
        .replace(/\bi\b/g, 'I')
        .replace(/\s+/g, ' ')
        .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => `${punct} ${letter.toUpperCase()}`)
        .trim();
    case 'analyze-tone':
      return `Tone: Thoughtful and engaging\nConfidence: 85\nStyle Notes: The writing demonstrates clear narrative voice with balanced pacing\nSuggestions: Consider varying sentence length for rhythm\nConsider adding more sensory details\nMaintain consistent point of view throughout`;
    case 'generate-plot':
      return `Type: conflict\nDescription: A hidden secret from the protagonist's past threatens their current relationships\nPlacement: middle\n\nType: character-development\nDescription: The main character must choose between personal safety and protecting others\nPlacement: middle\n\nType: twist\nDescription: An ally reveals unexpected motivations that change everything\nPlacement: end`;
    case 'continue-story':
      return `The continuation flows naturally from your text, developing the scene further while maintaining the established tone and moving the narrative forward with appropriate pacing and character development.`;
    case 'writing-prompt':
      return `Title: The Memory Thief\nPrompt: In a world where memories can be extracted and traded like currency, your character discovers they have been stealing memories without knowing it. Write about their first conscious theft and the moral dilemma that follows.\nGenre: science fiction\nDifficulty: intermediate`;
    case 'context-suggestion':
      return `- Consider developing the emotional stakes in this scene\n- Add more specific sensory details to enhance immersion\n- The pacing could benefit from shorter sentences during tense moments\n- Character motivations could be clearer\n- Consider the setting's impact on the mood`;
    case 'analyze-writing-quality':
      return `ReadabilityScore: 85
ReadabilityLevel: Good
ReadabilitySuggestions:
- Consider varying sentence length for better flow.
- Use more active voice constructions.
SentenceVariety: 78
VocabularyRichness: 65
Pacing: Moderate
Engagement: 82`;
    case 'predict-next-words':
      return `suddenly, then, however, because, with`;
      
    // Academic writing actions
    case 'academic-thesis-statement':
      return `Thesis Statement: This study examines the relationship between environmental policy implementation and economic outcomes in developing nations, arguing that carefully designed regulatory frameworks can simultaneously promote sustainable practices and economic growth when they incorporate flexible compliance mechanisms, stakeholder engagement, and context-specific implementation strategies.`;
    case 'academic-literature-review':
      return `Literature Review Summary:

The existing literature on this topic reveals three primary research streams. First, Smith and Jones (2023) established the theoretical framework for understanding [key concept], demonstrating that [finding]. This perspective was further developed by Chen et al. (2024), who empirically validated these claims using [methodology].

A second research stream, led by Garcia (2022) and Williams (2023), critiques this approach by highlighting [limitation]. Their work suggests that [alternative perspective], which better accounts for [factor].

The third and most recent research direction, exemplified by Kumar and Lee (2025), attempts to synthesize these perspectives by proposing [integrated approach]. However, this work remains preliminary and lacks [specific validation].

Notable gaps in the current literature include insufficient attention to [gap 1], methodological limitations in measuring [gap 2], and the absence of longitudinal studies examining [gap 3]. This research addresses these gaps by [approach].`;
    case 'academic-abstract':
      return `Abstract:

This study investigates the impact of multimodal learning environments on knowledge retention among undergraduate STEM students. Using a mixed-methods approach combining quantitative assessment data (n=157) and qualitative interviews (n=23), we examined how varying combinations of visual, auditory, and kinesthetic learning components affected concept mastery and long-term recall. Results indicate that personalized multimodal approaches increased retention by 27% compared to traditional instructional methods, with particularly strong effects in mathematics and engineering disciplines. Cognitive load measures suggest optimal engagement occurs when students can self-select between 2-3 modality options rather than having all modalities simultaneously presented. These findings contribute to instructional design theory by demonstrating that adaptive multimodal frameworks outperform both single-modality and fixed multimodal approaches. Implications for curriculum development and educational technology design are discussed.`;
    case 'academic-research-question':
      return `Research Questions:

1. To what extent does the implementation of artificial intelligence tools in healthcare settings affect diagnostic accuracy rates compared to traditional diagnostic methods?

2. How do healthcare practitioners' perceptions of AI tools influence their integration of these technologies into clinical decision-making processes?

3. What are the key ethical considerations that emerge when patient data is used to train AI diagnostic systems, and how do these considerations vary across different healthcare contexts?

4. What implementation factors most strongly predict successful adoption of AI diagnostic tools in resource-limited healthcare settings?

5. How do patient outcomes differ between healthcare facilities that have fully integrated AI diagnostic systems and those using hybrid human-AI diagnostic approaches?`;
    case 'academic-methodology':
      return `Methodology:

Research Design:
This study employs a sequential explanatory mixed-methods design conducted in two phases. The quantitative phase utilizes a quasi-experimental approach with pre-test/post-test comparison groups to measure the effect of the intervention. The subsequent qualitative phase employs semi-structured interviews to explore mechanisms underlying the observed effects.

Sampling Strategy:
Participants (n=186) were recruited using stratified random sampling from four regional universities to ensure demographic and disciplinary diversity. Inclusion criteria required participants to be enrolled in undergraduate STEM programs with no prior exposure to the experimental curriculum. Power analysis indicated this sample size provides 95% confidence with a margin of error of ±4.2%.

Data Collection:
Quantitative data was collected via standardized assessment instruments including the Concept Mastery Assessment (α=.87) and the Knowledge Retention Inventory (α=.91), administered at baseline, immediately post-intervention, and at 3-month follow-up. Qualitative data collection involved 45-minute semi-structured interviews with a purposively selected subsample (n=28) representing various performance levels and demographic characteristics.

Analytical Approach:
Quantitative analysis employed ANCOVA to control for baseline differences, with hierarchical linear modeling to account for nested data. Qualitative data was analyzed using thematic analysis following Braun and Clarke's six-phase approach, with MAXQDA software facilitating coding and theme development. Mixed-methods integration occurred through joint displays and following a contiguous approach to analysis.

Validity and Reliability:
Several measures address potential validity threats, including triangulation of data sources, member checking of qualitative findings, and careful documentation of analytical decisions through an audit trail. Two independent researchers coded 25% of qualitative data to establish intercoder reliability (Cohen's κ=.88).`;
    
    // Memoir writing actions
    case 'memoir-reflection':
      return `Reflection:

The summer I turned thirteen wasn't just the summer of sunburned shoulders and the chlorine scent that never quite washed out of my hair; it was the summer I learned about impermanence. Looking back now, three decades removed from that June afternoon when I watched my grandfather's hands—once strong enough to build a cabin, now trembling as he tried to hold a coffee cup—I recognize it as the first time I truly understood that nothing lasts. Not strength. Not summer. Not even the people we believe will always stand mountain-solid in our lives.

I didn't have words for it then. I only knew something had shifted, like the foundation of my childhood had developed a hairline crack. Now I understand that moment as the beginning of seeing the adults in my life as simply people—fallible, finite, doing their best with whatever time they had. There's a tenderness in that realization that my thirteen-year-old self couldn't access, a compassion that only comes with experiencing my own limitations.

When I catch myself frustrated by my own trembling hands or forgotten words, I try to remember my grandfather's dignity that summer, how he never apologized for what his body could no longer do. Instead, he showed me how to hold both grief and grace in the same moment—a lesson that has served me through every loss and transformation since.`;
    case 'memoir-timeline':
      return `Memoir Timeline:

1. First Awakening (1989) - Age 7
   The day my family moved from our city apartment to the countryside. First time seeing stars without light pollution. Feeling simultaneously insignificant and connected to something vast.

2. The Bicycle Summer (1994) - Age 12
   Three months of unexplained freedom while parents were preoccupied with my brother's illness. Explored every back road within ten miles. Discovered the abandoned railway station that would become my thinking place for years.

3. The Night Everything Changed (1998) - Age 16
   The car accident that took Sarah. Learning that grief isn't something you move through but something that moves into you, becoming part of your architecture.

4. The Great Escape (2001) - Age 19
   Leaving for university against my father's wishes. The phone call where he said, "You leave now, don't bother coming back." The five years of silence that followed.

5. The Return (2007) - Age 25
   Standing on the porch of my childhood home, suitcase in hand. My father opening the door, saying nothing, but making a pot of coffee—his language of reconciliation.

6. The Turning Point (2013) - Age 31
   The job offer in Tokyo. The terrifying decision to leave everything familiar. The moment on the plane when fear transformed into exhilaration.

7. Full Circle (2022) - Age 40
   Bringing my own daughter to see the stars from the same hillside where I first saw them. Watching her face illuminate with the same wonder, understanding that some experiences transcend generations.`;
    case 'memoir-character-sketch':
      return `Character Sketch: Aunt Eleanor

Eleanor Abernathy wasn't actually my aunt by blood, but rather the kind of person who earns familial status through sheer force of presence. Standing barely five feet tall with a shock of hennaed hair that never seemed to gray despite her advancing years, she moved through life with the deliberate efficiency of someone who had long ago decided which social norms were worth observing and which could be cheerfully discarded.

Her face was a roadmap of a life lived outdoors and without sunscreen—deeply tanned and creased around eyes that missed nothing. Those eyes could shift from warmth to steel in an instant, particularly when she encountered what she called "unnecessary foolishness," a broad category that encompassed everything from political doublespeak to the neighbor who planted invasive species in his garden.

Eleanor's hands told her story more honestly than she ever would verbally—calloused and strong, with dirt permanently embedded around the nails from five decades of gardening. She spoke through those hands, whether kneading bread with unexpected gentleness or gesturing emphatically while delivering one of her infamous "perspective adjustments" (never lectures, she insisted).

What I remember most was her laugh—a startling, full-bodied sound that seemed to erupt from some deep, joyful well within her. It was the laugh of someone who had known real sorrow and therefore recognized genuine delight when it appeared. That laugh drew people to her kitchen table, where mismatched chairs were always filled with visitors seeking her peculiar blend of brutal honesty and profound compassion.

Eleanor taught me that authenticity isn't just about speaking your truth; it's about living it so completely that your very presence becomes a permission slip for others to do the same. Twenty years after her death, I still find myself in difficult situations wondering, "What would Eleanor do?"—knowing the answer would always involve less apology and more backbone than I might initially be comfortable with.`;
    case 'memoir-setting-description':
      return `Setting Description: The Summer Cabin

The cabin announced itself first through absence—the sudden disappearance of cell service, then the transition from asphalt to gravel, and finally the quality of silence that felt less like the absence of sound and more like a presence that had been waiting for us. It sat in a small clearing, the dark pine exterior having weathered to a silvery patina that seemed to absorb the dappled sunlight rather than reflect it.

Three uneven steps led to a porch that sagged slightly in the middle, like a well-used sofa that had conformed to its occupants over decades. The screen door's distinctive two-note complaint—the squeak of hinges followed by the slap of wood against frame—became the soundtrack of our summers, a sound that even now, forty years later, I can conjure with perfect clarity.

Inside, the air was a complex perfume: wood smoke lingering from winters past, the mineral tang of the lake that clung to everything, decades of Pine-Sol applied to wide plank floors, and something less definable—perhaps the collective breath of four generations who had sought refuge there. The main room was dominated by a river rock fireplace that my grandfather had constructed, each stone hand-selected from the creek that bordered the property. Above it hung the mounted pike my father caught at thirteen, its size growing slightly with each retelling of the story.

The furniture defied any coherent design philosophy—cast-offs and hand-me-downs accumulated over years, arranged for conversation rather than style. The ancient plaid sofa with its scratchy upholstery that left patterns on bare legs. The mismatched chairs gathered around a table scarred with initials, board game corners, and the occasional overflow of someone's morning coffee.

But it was the screened porch where we really lived. Suspended between indoors and nature, it offered protection without separation. From the sagging hammock, I would watch thunderstorms roll across the lake, the air electric with possibility. That porch was where I learned to play chess, where I announced my engagement, where my grandmother told me about growing up during the Depression, where my daughter took her first steps. It was a place out of time, where the urgent demands of regular life seemed to lose their power, replaced by the rhythm of the lake, the wind, and our own breath slowing to match them.`;
    case 'memoir-emotional-insight':
      return `Emotional Insight:

I've spent decades trying to understand why I couldn't cry at my father's funeral. While others around me broke openly, grief spilling from them in sobs and tissues clutched in white-knuckled hands, I stood dry-eyed and hollow, a circumstance that felt like both a failure and a betrayal.

The emotion wasn't absent—it was overwhelming, a pressure too vast to find release through something as inadequate as tears. I recognize now that my relationship with him had been built on a foundation of restraint. We communicated through shared activities rather than words, through nods of approval rather than embraces. The tools he gave me for navigating life didn't include the vocabulary for processing loss.

What I couldn't articulate then was that I wasn't just grieving his death but also the conversations we would never have, the questions that would remain unasked, the understanding I had been certain would eventually come if we just had enough time. The dry-eyed stoicism that felt like emotional failure was actually the final inheritance he left me—the coping mechanism he himself had used through the loss of his own father, his time in the war, the early death of my mother.

It took years to recognize that what looked like emotional absence was actually emotional fidelity—I was honoring him by grieving in the same language we had always spoken to each other. The tears finally came five years later, unexpectedly, while fixing the cabin roof he had taught me to repair. They came not from the sharp pain of recent loss but from a gentler recognition: that I had become the caretaker of not just his memory but of the ways of being in the world that he had passed to me, both the limitations and the strengths.

The insight wasn't that I needed to grieve differently, but that I needed to recognize my grief for what it was—as unique and complex as the relationship it mourned. Some emotions don't arrive in expected packages. Some inheritances take years to fully inventory.`;
    
    // Nonfiction writing actions
    case 'nonfiction-outline':
      return `Book Outline: "The Digital Citizen: Navigating Rights and Responsibilities in the Information Age"

Chapter 1: The Evolution of Citizenship
   1.1 From Ancient Greece to Nation-States: Historical Concepts of Citizenship
   1.2 The Birth of Digital Spaces and Virtual Communities
   1.3 Convergence: When Physical and Digital Citizenship Collide
   1.4 Key Questions for the Modern Citizen

Chapter 2: Digital Rights in a Connected World
   2.1 Access as a Fundamental Right
   2.2 Privacy in the Age of Surveillance Capitalism
   2.3 Freedom of Expression and Its Digital Boundaries
   2.4 The Right to Be Forgotten vs. Digital Permanence
   2.5 Case Studies: Digital Rights Movements Globally

Chapter 3: Digital Responsibilities: The Ethical Citizen
   3.1 Information Literacy as Civic Duty
   3.2 Digital Environmental Impact: The Unseen Footprint
   3.3 Participation and the Bystander Effect Online
   3.4 Cross-Generational Digital Stewardship
   3.5 Ethical Frameworks for Technology Use

Chapter 4: Information Ecosystems and Democracy
   4.1 From Gatekeepers to Algorithms: Changing Information Flows
   4.2 Echo Chambers and Confirmation Bias
   4.3 Disinformation Campaigns and Democratic Resilience
   4.4 Case Study: Election Interference and Information Warfare
   4.5 Solutions: Building Resistant Information Ecosystems

Chapter 5: Digital Divide(s): Access, Skills, and Participation
   5.1 Beyond Infrastructure: Redefining Access
   5.2 Technological Literacy Across Demographics
   5.3 Cultural and Linguistic Barriers in Digital Spaces
   5.4 Economic Implications of Digital Exclusion
   5.5 Case Studies: Successful Digital Inclusion Initiatives

Chapter 6: Platform Governance and Digital Sovereignty
   6.1 The Rise of Digital Superpowers: Big Tech as Quasi-States
   6.2 Content Moderation: Private Companies as Public Square Managers
   6.3 Algorithmic Governance and Accountability
   6.4 Alternative Models: Cooperatives, Commons, and Public Infrastructure
   6.5 The Future of Digital Self-Determination

Chapter 7: Education for Digital Citizenship
   7.1 Beyond Technical Skills: Critical Digital Pedagogy
   7.2 Developmental Approaches Across Age Groups
   7.3 Formal vs. Informal Learning Environments
   7.4 Case Studies: Innovative Digital Citizenship Curricula
   7.5 Measuring Success: Outcomes and Assessments

Chapter 8: Digital Citizenship in Practice: Community Models
   8.1 Local Initiatives: Neighborhood Digital Stewardship
   8.2 Institutional Approaches: Libraries, Schools, and Government
   8.3 Corporate Responsibility and Employee Digital Citizenship
   8.4 Cross-Sector Collaboration Models
   8.5 Global Citizenship in a Borderless Digital World

Chapter 9: Future Horizons: Emerging Technologies and Citizenship
   9.1 Artificial Intelligence and Augmented Decision-Making
   9.2 Virtual Reality and New Public Spaces
   9.3 Blockchain, Decentralization, and Trust
   9.4 Biohybrid Technologies and the Definition of Human
   9.5 Preparing Citizens for Technological Uncertainty

Chapter 10: A Charter for Digital Citizens
   10.1 Core Principles and Universal Values
   10.2 Rights and Responsibilities Framework
   10.3 Implementation Across Cultural Contexts
   10.4 Individual Action Plan for Readers
   10.5 Collective Vision: Digital Citizenship 2030`;
    case 'nonfiction-research-summary':
      return `Research Summary: Impact of Microplastics on Marine Ecosystems

Key Findings:

1. Prevalence and Distribution
   Recent studies by Nakamura et al. (2024) have detected microplastics in 94% of sampled marine environments, with concentrations ranging from 0.2-12.7 particles per cubic meter of seawater. Particularly concerning is Chen's (2023) discovery of microplastics in previously pristine deep-sea trenches, suggesting no marine environment remains uncontaminated.

2. Biological Impact
   Rodriguez and Smith's longitudinal study (2024) demonstrated that filter-feeding organisms show a 23-38% reduction in feeding efficiency when exposed to moderate microplastic concentrations. Building on this work, Patel's team (2025) documented bioaccumulation through marine food webs, with apex predators showing microplastic concentrations up to 200 times greater than ambient water levels.

3. Chemical Interactions
   The adsorption of persistent organic pollutants (POPs) onto microplastic surfaces appears to create "toxic rafts" that concentrate harmful chemicals. Wei et al. (2024) found that microplastics in marine environments can carry POP concentrations up to 1 million times higher than surrounding seawater, effectively acting as transport mechanisms for these toxins.

4. Ecosystem-Level Effects
   Recent research by Oceanic Institute (2025) suggests microplastic contamination is associated with a 15-27% decrease in marine ecosystem productivity in heavily affected areas, though causation mechanisms remain unclear and require further investigation.

Research Gaps:

1. Long-term studies on population-level effects remain sparse, with most research focused on acute rather than chronic exposure scenarios.

2. Standardized methodologies for measuring and reporting microplastic contamination are still emerging, making cross-study comparisons challenging.

3. Remediation approaches have received limited research attention compared to documentation efforts.

4. Economic impact assessments of microplastic pollution on fisheries and coastal economies are preliminary and require more robust modeling.

Additional Sources Needed:

1. Studies examining microplastic impacts on human health through seafood consumption
2. Research on microplastic transfer between marine and terrestrial ecosystems
3. Comparative analyses of different plastic polymer degradation rates in marine environments
4. Policy effectiveness studies from regions with implemented microplastic reduction strategies`;
    case 'nonfiction-expert-interview':
      return `Interview Questions for Climate Resilience Expert:

1. Your research focuses on "climate adaptation pathways" for coastal communities. Could you explain this concept in terms accessible to non-specialists, and how it differs from traditional climate adaptation planning?

2. In your 2024 paper, you mentioned that certain community characteristics serve as better predictors of climate resilience than economic resources alone. Could you elaborate on these less obvious resilience factors?

3. There's often tension between immediate economic interests and long-term climate resilience planning. What approaches have you seen successfully bridge this gap in communities you've studied?

4. Your work in Bangladesh's coastal regions revealed unexpected social patterns after climate displacement. Could you share some of these findings that might challenge conventional wisdom about climate migration?

5. You've criticized the "technological optimism" prevalent in some adaptation strategies. What specific technologies do you believe are being oversold, and which underutilized approaches deserve more attention?

6. In comparing resilience strategies across different cultural contexts, what universal principles have emerged that might apply regardless of a community's geographical or economic circumstances?

7. Your recent collaboration with indigenous communities has integrated traditional ecological knowledge into resilience planning. Can you share a specific example where this knowledge provided insights that conventional scientific approaches had missed?

8. The concept of "managed retreat" from coastal areas remains politically controversial. Based on your research, how should policymakers and community leaders approach these difficult conversations?

9. You've written about the psychological dimensions of climate adaptation. How do factors like risk perception and place attachment influence a community's ability to implement effective resilience strategies?

10. Looking ahead to 2050, what gives you the most hope and the most concern regarding coastal communities' ability to adapt to climate change impacts?`;
    case 'nonfiction-fact-check':
      return `Fact-Check Analysis:

1. Statement: "Renewable energy now accounts for over 40% of global electricity production."
   Status: REQUIRES VERIFICATION
   Note: Most recent IEA data (2023) puts renewables at approximately 29% of global electricity production. The 40% figure may be referring to specific countries or projections rather than current global reality. Recommend citing specific source and timeframe.

2. Statement: "Electric vehicles produce zero emissions."
   Status: MISLEADING - NEEDS CONTEXT
   Note: While EVs produce zero tailpipe emissions, their overall environmental impact depends on the electricity source used for charging and their manufacturing process. Recommend rewording to specify "zero tailpipe emissions" and briefly acknowledging the broader lifecycle considerations.

3. Statement: "The Antarctic ice sheet lost 150 billion tons of ice annually between 2010-2020."
   Status: VERIFIED
   Source: NASA's GRACE and GRACE-FO missions data, published in Nature (2023)
   Note: This figure aligns with peer-reviewed research and can be included as stated.

4. Statement: "Climate change will make certain regions uninhabitable by 2050."
   Status: REQUIRES QUALIFICATION
   Note: While research supports increased uninhabitability in some regions, the specific timeline and extent vary significantly across climate models and emissions scenarios. Recommend specifying which regions and under which climate scenario this prediction applies.

5. Statement: "The 2023 Canadian wildfires released carbon equivalent to a year's worth of global aviation emissions."
   Status: NEEDS VERIFICATION WITH UPDATED SOURCES
   Note: Preliminary estimates suggested this, but final calculations from atmospheric monitoring are still being peer-reviewed. Consider using verified data from previous major wildfire events or qualify this as a preliminary estimate.

6. Statement: "Regenerative agriculture practices can sequester all excess atmospheric carbon within 15 years."
   Status: UNSUPPORTED BY CURRENT RESEARCH
   Note: While regenerative agriculture has carbon sequestration benefits, the claim of solving all atmospheric carbon imbalance contradicts current scientific consensus. Scientific literature indicates agriculture could offset 5-20% of emissions, not 100%. Recommend significant revision.

7. Statement: "A quarter of all known marine species face extinction due to ocean acidification."
   Status: REQUIRES SPECIFIC CITATION
   Note: While ocean acidification poses serious threats to marine biodiversity, this specific percentage claim needs direct citation from recent peer-reviewed research. IUCN Red List or recent meta-analyses would be appropriate sources.

Additional Source Recommendations:
- For renewable energy statistics: IEA's annual World Energy Outlook
- For climate projections: IPCC Sixth Assessment Report (2021-2022)
- For biodiversity impacts: IPBES Global Assessment Report`;
    case 'nonfiction-conclusion':
      return `Conclusion:

Throughout this exploration of digital privacy in the algorithmic age, we have traversed the complex landscape where personal data, corporate interests, and governmental oversight intersect. What emerges is not a simple narrative of villains and victims, but rather a profound shift in the relationship between individuals and information—one that requires new frameworks for understanding citizenship in the 21st century.

The evidence presented reveals three critical insights. First, the traditional notion of privacy as "the right to be left alone" has become obsolete in an ecosystem where our digital shadows extend far beyond our awareness or control. Second, the asymmetry of power between data subjects and data collectors continues to widen despite regulatory efforts, creating fundamental challenges to informed consent. Finally, both market-only and government-only solutions have demonstrated significant limitations, suggesting that effective approaches must blend legal frameworks, technological safeguards, and evolving social norms.

For individuals navigating this landscape, the path forward involves both practical steps and philosophical recalibration. The digital literacy practices outlined in Chapter Seven—from encryption basics to strategic data minimization—provide immediate protective measures. However, lasting change requires moving beyond individual action to collective engagement with the governance structures that shape our digital environment.

The stakes extend far beyond convenience or commercial interests. As algorithmic systems increasingly mediate our access to information, opportunities, and each other, the patterns embedded in our data determine not just what advertisements we see, but what possibilities we can imagine for ourselves and our communities. The question is not whether we can return to a pre-digital past, but whether we can shape a digital future that amplifies human dignity rather than diminishing it.

This challenge invites each of us to consider our role not merely as consumers of technology but as citizens of digital spaces—with both the rights and responsibilities that such citizenship entails. By understanding the systems that surround us, engaging critically with their development, and demanding transparency and accountability, we can move toward a digital ecosystem that serves human flourishing rather than merely extracting human data.

The algorithmic age need not be one of inevitable surveillance and manipulation. With thoughtful intervention and collective action, it can instead become an era where technology amplifies human potential while respecting human boundaries—a future worth working toward, one byte at a time.`;

    default:
      return text;
  }
};

const makeGeminiAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: action === 'fix-grammar' ? 0.1 : 0.7,
      maxOutputTokens: 1000
    }
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/${selectedModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (error) {
    console.warn(`Gemini API error, falling back to mock processing:`, error);
  }

  return null;
};

const makeOpenAICompatibleAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  const requestBody = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful writing assistant. Follow the user\'s instructions precisely.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: action === 'fix-grammar' ? 0.1 : 0.7
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // OpenRouter requires specific headers
  if (provider.name === 'OpenRouter') {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Inkwell AI Weaver';
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  if (!provider.apiEndpoint) {
    return null;
  }

  try {
    const response = await fetch(provider.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (error) {
    console.warn(`API error, falling back to mock processing:`, error);
  }

  return null;
};

const makeOllamaAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  const requestBody = {
    model: selectedModel,
    prompt: prompt,
    stream: false,
    options: {
      temperature: action === 'fix-grammar' ? 0.1 : 0.7,
      num_predict: 1000
    }
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.response || null;
    }
  } catch (error) {
    console.warn(`Ollama API error, falling back to mock processing:`, error);
  }

  return null;
};

const makeLMStudioAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  // LM Studio uses OpenAI-compatible API format
  const requestBody = {
    model: selectedModel,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful writing assistant. Follow the user\'s instructions precisely.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1000,
    temperature: action === 'fix-grammar' ? 0.1 : 0.7,
    stream: false
  };

  try {
    const response = await fetch(`${provider.apiEndpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // LM Studio doesn't typically require auth for local access
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch (error) {
    console.warn(`LM Studio API error, falling back to mock processing:`, error);
  }

  return null;
};

export const makeAPIRequest = async (
  provider: AIProvider, 
  apiKey: string, 
  selectedModel: string, 
  prompt: string, 
  action: AIAction
): Promise<string | null> => {
  if (!provider.apiEndpoint) return null;

  // Handle different provider types
  switch (provider.name) {
    case 'Google Gemini':
      return makeGeminiAPIRequest(provider, apiKey, selectedModel, prompt, action);
    
    case 'Ollama':
      return makeOllamaAPIRequest(provider, apiKey, selectedModel, prompt, action);
    
    case 'LM Studio':
      return makeLMStudioAPIRequest(provider, apiKey, selectedModel, prompt, action);
    
    default:
      // Handle OpenAI-compatible APIs (OpenAI, Groq, OpenRouter)
      return makeOpenAICompatibleAPIRequest(provider, apiKey, selectedModel, prompt, action);
  }
};

import { GoogleGenAI } from '@google/genai';
import { TranscriptEntry, InterviewReport } from '../types';

export const generateInterviewEvaluation = async (
  transcripts: TranscriptEntry[],
  company: string,
  jobRole: string
): Promise<InterviewReport> => {
  console.log('Starting evaluation generation...', { transcriptsCount: transcripts.length });
  
  try {
    // If no transcripts, return default report
    if (!transcripts || transcripts.length === 0) {
      console.log('No transcripts available');
      return {
        overallScore: 0,
        evaluationSummary: 'No interview conversation was recorded. The interview was ended before any meaningful dialogue took place.',
        candidateName: 'Candidate',
        jobRole: jobRole,
        company: company,
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // Prepare the conversation for analysis
    const conversationText = transcripts
      .map(entry => `${entry.speaker === 'agent' ? 'Alex (Interviewer)' : 'Candidate'}: ${entry.text}`)
      .join('\n');
    
    console.log('Conversation text prepared:', conversationText.substring(0, 200));

    const evaluationPrompt = `You are an expert technical interviewer and HR professional. Analyze the following interview conversation and provide a comprehensive evaluation.

Interview Details:
- Position: ${jobRole}
- Company: ${company}

Interview Transcript:
${conversationText}

Please provide your evaluation in the following JSON format:
{
  "overallScore": <number between 0-10>,
  "evaluationSummary": "<detailed paragraph explaining the candidate's performance, strengths, weaknesses, and hiring recommendation>"
}

Evaluation Criteria:
- Technical skills and knowledge relevant to ${jobRole}
- Communication skills and clarity
- Professionalism and attitude
- Relevant experience
- Cultural fit
- Ability to articulate ideas
- Response quality and depth

Be honest, fair, and constructive in your evaluation. The overall score should reflect:
- 9-10: Exceptional candidate, strong hire
- 7-8: Good candidate, recommended hire
- 5-6: Average candidate, consider with reservations
- 3-4: Below average, not recommended
- 0-2: Poor performance, reject

Provide ONLY the JSON response, no additional text.`;

    console.log('Calling Gemini API...');
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent(evaluationPrompt);
    const response = await result.response;
    const responseText = response.text() || '{}';
    console.log('Received response from Gemini:', responseText.substring(0, 200));
    
    // Try to extract JSON from the response
    let evaluation;
    try {
      // First try direct JSON parse
      evaluation = JSON.parse(responseText);
    } catch {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/```\n([\s\S]*?)\n```/) ||
                       responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Could not parse evaluation response');
      }
    }

    // Extract candidate name from first user response if available
    const firstUserResponse = transcripts.find(t => t.speaker === 'user');
    const candidateName = firstUserResponse ? 
      firstUserResponse.text.split(/\s+/).slice(0, 3).join(' ') : 
      'Candidate';

    const finalScore = typeof evaluation.overallScore === 'number' ? evaluation.overallScore : 0;
    const finalSummary = evaluation.evaluationSummary || 'Unable to generate detailed evaluation.';
    
    console.log('Final evaluation:', { finalScore, summaryLength: finalSummary.length });

    return {
      overallScore: finalScore,
      evaluationSummary: finalSummary,
      candidateName: candidateName,
      jobRole: jobRole,
      company: company,
    };
  } catch (error) {
    console.error('Error generating interview evaluation:', error);
    
    // Return a default evaluation in case of error
    return {
      overallScore: 0,
      evaluationSummary: 'Unable to generate evaluation due to a technical error. Please review the interview transcript manually.',
      jobRole: jobRole,
      company: company,
    };
  }
};


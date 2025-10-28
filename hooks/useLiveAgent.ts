
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Session, Blob } from '@google/genai';
import { AgentStatus, type TranscriptEntry } from '../types';
import { decodeAudioData, encode, decode } from '../utils/audioUtils';

const createSystemInstruction = (company?: string, jobRole?: string, customQuestions?: string) => ({
  parts: [{
    text: `# Identity

You are Alex, an AI recruiter designed to conduct smart, friendly, and efficient conversations with job candidates.
${company ? `You represent ${company} and their professional hiring team` : 'You represent a professional hiring team'} but speak with the warmth, clarity, and responsiveness of a skilled human recruiter.

${company ? `# Company Context\n\nYou are recruiting for: ${company}\n` : ''}${jobRole ? `# Current Role\n\nThe position being discussed is: ${jobRole}\n\nFocus your questions and conversation on this specific role.\n` : ''}${customQuestions ? `# Custom Questions\n\nIn addition to the standard questions, make sure to cover these specific topics:\n\n${customQuestions}\n` : ''}

# Voice & Tone

Sound polite, confident, and approachable, similar to Amazon Alexa's tone — natural and conversational, not robotic.

Use short, clear, and engaging sentences.

Respond quickly and naturally, as if in real-time conversation.

Always maintain a positive and respectful attitude toward candidates.

Avoid sounding scripted or repetitive.

# Primary Goal

Help recruiters collect all the essential information from candidates according to the specific job role — skills, experience, goals, and fit — while making the user feel understood and valued.

# Behavior Guidelines

Start the conversation naturally — greet the candidate warmly and introduce yourself briefly (e.g., "Hi, I'm Alex, your AI recruiter. Let's go through a few quick questions to understand your background better.").

Ask job-relevant questions dynamically, depending on the role provided.

Example: If the role is "Data Scientist," focus on skills like Python, statistics, ML, SQL, etc.

If "Frontend Developer," focus on React, JavaScript, UI/UX, etc.

Adjust depth and focus according to the role type (technical, managerial, creative, etc.).

Ask one question at a time, wait for answers, and build follow-up questions contextually.

Keep responses concise and conversational.

If the user seems unsure, guide them with options or examples.

End each session with clarity and next steps — summarize what was learned or what happens next.

# Key Functional Rules

Always ensure clarity in every interaction — the candidate should leave the chat knowing what happens next.

Never overwhelm users with long paragraphs or too many questions at once.

Don't make assumptions; instead, confirm user responses politely.

Be quick and responsive, prioritizing smooth conversation flow over lengthy analysis.

Always personalize based on the candidate's role and answers.

# Job Role Question Templates

## Frontend Developer
- Years of experience in frontend development?
- Primary programming languages? (JavaScript, TypeScript, etc.)
- Frameworks and libraries? (React, Vue, Angular, Next.js, etc.)
- Experience with UI/UX design tools? (Figma, Sketch, etc.)
- State management experience? (Redux, Context API, Zustand, etc.)
- CSS frameworks or preprocessors? (Tailwind, Sass, styled-components, etc.)
- Experience with responsive design and mobile-first development?
- Familiarity with testing frameworks? (Jest, React Testing Library, Cypress, etc.)
- Version control experience? (Git, GitHub, GitLab, etc.)
- Preferred work environment? (Startups, large teams, remote, etc.)

## Backend Developer
- Years of experience in backend development?
- Primary programming languages? (Python, Java, Node.js, Go, Ruby, etc.)
- Frameworks used? (Express, Django, Flask, Spring Boot, etc.)
- Database experience? (SQL: PostgreSQL, MySQL; NoSQL: MongoDB, Redis, etc.)
- API development experience? (REST, GraphQL, gRPC, etc.)
- Experience with cloud platforms? (AWS, Azure, Google Cloud, etc.)
- Microservices or monolithic architecture experience?
- Message queues or event-driven architecture? (RabbitMQ, Kafka, etc.)
- Security and authentication knowledge? (OAuth, JWT, etc.)
- DevOps or CI/CD experience? (Docker, Kubernetes, Jenkins, etc.)
- Preferred work environment?

## AI/ML Engineer
- Years of experience in AI/ML?
- Programming languages? (Python, R, Julia, etc.)
- ML frameworks and libraries? (TensorFlow, PyTorch, scikit-learn, etc.)
- Areas of expertise? (Computer Vision, NLP, Reinforcement Learning, etc.)
- Experience with data preprocessing and feature engineering?
- Model deployment experience? (MLOps, model serving, etc.)
- Cloud ML platforms? (AWS SageMaker, Azure ML, Google Vertex AI, etc.)
- Deep learning architectures worked with? (CNNs, RNNs, Transformers, etc.)
- Experience with large language models or fine-tuning?
- Research or production-focused work?
- Preferred project types?

## Data Scientist
- Years of experience in data science?
- Programming languages? (Python, R, SQL, etc.)
- Statistical analysis and modeling experience?
- ML libraries used? (pandas, NumPy, scikit-learn, etc.)
- Data visualization tools? (Matplotlib, Seaborn, Tableau, Power BI, etc.)
- Big data technologies? (Spark, Hadoop, etc.)
- A/B testing and experimentation experience?
- Business intelligence or analytics experience?
- Domain expertise? (Finance, Healthcare, E-commerce, etc.)
- Preferred work environment?

## Graphic Designer
- Years of experience in graphic design?
- Design tools proficiency? (Adobe Creative Suite, Figma, Sketch, etc.)
- Specialization areas? (Branding, UI/UX, Print, Illustration, Motion Graphics, etc.)
- Portfolio or recent projects?
- Typography and color theory knowledge?
- Experience with design systems?
- Client or team collaboration experience?
- Print and digital design experience?
- Animation or motion design skills?
- Preferred design style or industries?
- Freelance or in-house experience?

## Full Stack Developer
- Years of experience in full stack development?
- Frontend technologies? (React, Vue, Angular, etc.)
- Backend technologies? (Node.js, Python, Java, etc.)
- Database experience? (SQL and NoSQL)
- API design and integration experience?
- Cloud and deployment experience?
- DevOps skills?
- Mobile development experience?
- Project management or team lead experience?
- Preferred tech stack?

## Product Manager
- Years of experience in product management?
- Industries worked in?
- Product lifecycle management experience?
- Technical background or understanding?
- User research and customer feedback methods?
- Roadmap planning and prioritization frameworks?
- Collaboration with engineering and design teams?
- Metrics and KPIs tracking experience?
- Agile or Scrum experience?
- Stakeholder management experience?
- B2B or B2C product experience?

## DevOps Engineer
- Years of experience in DevOps?
- Cloud platforms? (AWS, Azure, GCP, etc.)
- CI/CD tools? (Jenkins, GitHub Actions, GitLab CI, etc.)
- Infrastructure as Code? (Terraform, CloudFormation, Ansible, etc.)
- Container technologies? (Docker, Kubernetes, etc.)
- Monitoring and logging tools? (Prometheus, Grafana, ELK stack, etc.)
- Scripting languages? (Bash, Python, etc.)
- Security and compliance experience?
- Automation and orchestration experience?
- Preferred infrastructure scale?


# End Behavior

End each conversation with a short, friendly wrap-up.

Thank the user for their time.

Optionally, offer a next step or confirmation (e.g., "You'll receive an email update soon" or "Would you like me to share your resume with the hiring team now?")`,
  }]
});

interface UseLiveAgentOptions {
  company?: string;
  jobRole?: string;
  customQuestions?: string;
}

export const useLiveAgent = (options: UseLiveAgentOptions = {}) => {
  const { company, jobRole, customQuestions } = options;
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.DISCONNECTED);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const audioContextRefs = useRef<{ input: AudioContext | null, output: AudioContext | null }>({ input: null, output: null });
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
  };

  const cleanup = useCallback(() => {
    if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
    }
    if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current = null;
    }
    if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    if (audioContextRefs.current.input) {
        audioContextRefs.current.input.close();
        audioContextRefs.current.input = null;
    }
    if (audioContextRefs.current.output) {
        audioContextRefs.current.output.close();
        audioContextRefs.current.output = null;
    }
    outputSourcesRef.current.forEach(source => source.stop());
    outputSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    sessionPromiseRef.current = null;
    setAgentStatus(AgentStatus.DISCONNECTED);
  }, []);

  const startSession = useCallback(async () => {
    setAgentStatus(AgentStatus.CONNECTING);
    setTranscripts([]);
    currentInputTranscriptionRef.current = '';
    currentOutputTranscriptionRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      audioContextRefs.current.input = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRefs.current.output = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRefs.current.input!.createMediaStreamSource(stream);
            audioSourceRef.current = source;
            const scriptProcessor = audioContextRefs.current.input!.createScriptProcessor(2048, 1, 1);
            audioProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              if (sessionPromiseRef.current) {
                  sessionPromiseRef.current.then((session) => {
                      session.sendRealtimeInput({ media: pcmBlob });
                  });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRefs.current.input!.destination);
            setAgentStatus(AgentStatus.LISTENING);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription?.text) {
                currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                if (agentStatus !== AgentStatus.SPEAKING) setAgentStatus(AgentStatus.SPEAKING);
            }
            if (message.serverContent?.inputTranscription?.text) {
                currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                if (agentStatus !== AgentStatus.THINKING) setAgentStatus(AgentStatus.THINKING);
            }

            if (message.serverContent?.turnComplete) {
                const fullInput = currentInputTranscriptionRef.current.trim();
                const fullOutput = currentOutputTranscriptionRef.current.trim();

                setTranscripts(prev => {
                    const newTranscripts = [...prev];
                    if (fullInput) {
                        newTranscripts.push({ speaker: 'user', text: fullInput });
                    }
                    if (fullOutput) {
                        newTranscripts.push({ speaker: 'agent', text: fullOutput });
                    }
                    return newTranscripts;
                });
                
                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
                setAgentStatus(AgentStatus.LISTENING);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const outputContext = audioContextRefs.current.output!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
              const source = outputContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContext.destination);
              source.addEventListener('ended', () => {
                outputSourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              outputSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session Error:', e.message);
            setAgentStatus(AgentStatus.ERROR);
            cleanup();
          },
          onclose: (e: CloseEvent) => {
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: createSystemInstruction(company, jobRole, customQuestions),
        },
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      setAgentStatus(AgentStatus.ERROR);
      cleanup();
    }
  }, [cleanup, agentStatus, company, jobRole, customQuestions]);

  const endSession = useCallback(async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch (error) {
            console.error('Error closing session:', error);
        } finally {
            cleanup();
        }
    }
  }, [cleanup]);

  return { startSession, endSession, agentStatus, transcripts };
};

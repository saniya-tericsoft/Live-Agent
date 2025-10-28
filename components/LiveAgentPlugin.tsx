import React, { useState, useEffect, useRef } from 'react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { AgentStatus, InterviewReport as InterviewReportType } from '../types';
import { IconMic, IconStop, IconUser, IconAlex } from './IconComponents';
import { InterviewReport } from './InterviewReport';
import { generateInterviewEvaluation } from '../utils/interviewEvaluation';

interface LiveAgentPluginProps {
  onStartLiveAgent: () => void;
  company?: string;
  jobRole?: string;
  customQuestions?: string;
}

export const LiveAgentPlugin: React.FC<LiveAgentPluginProps> = ({ 
  onStartLiveAgent, 
  company, 
  jobRole, 
  customQuestions 
}) => {
  const {
    startSession,
    endSession,
    agentStatus,
    transcripts,
  } = useLiveAgent({ company, jobRole, customQuestions });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [interviewReport, setInterviewReport] = useState<InterviewReportType | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = agentStatus !== AgentStatus.DISCONNECTED && agentStatus !== AgentStatus.ERROR;

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false // Audio is handled separately by useLiveAgent
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    startCamera();

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      // Combine video and audio streams for recording
      const combinedStream = new MediaStream();
      
      // Add video tracks
      if (videoStream) {
        videoStream.getVideoTracks().forEach(track => {
          combinedStream.addTrack(track);
        });
      }

      // Add audio tracks from the microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-${company || 'recording'}-${new Date().toISOString()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleStartSession = () => {
    onStartLiveAgent();
    startSession();
    startRecording();
  };

  const handleEndSession = async () => {
    console.log('Ending session...', { transcriptsCount: transcripts.length });
    endSession();
    stopRecording();
    
    // Always show report, even if transcripts are empty
    setIsGeneratingReport(true);
    
    try {
      console.log('Generating evaluation with transcripts:', transcripts);
      const report = await generateInterviewEvaluation(
        transcripts,
        company || 'Company',
        jobRole || 'Position'
      );
      console.log('Generated report:', report);
      setInterviewReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
      // Show fallback report
      setInterviewReport({
        overallScore: 5.0,
        evaluationSummary: 'Interview completed. Unable to generate detailed evaluation. Please review the recording for assessment.',
        candidateName: 'Candidate',
        jobRole: jobRole || 'Position',
        company: company || 'Company',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCloseReport = () => {
    setInterviewReport(null);
  };

  const getStatusColor = () => {
    switch (agentStatus) {
      case AgentStatus.CONNECTING:
        return 'bg-yellow-500';
      case AgentStatus.LISTENING:
        return 'bg-green-500';
      case AgentStatus.THINKING:
        return 'bg-blue-500';
      case AgentStatus.SPEAKING:
        return 'bg-purple-500';
      case AgentStatus.ERROR:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (agentStatus) {
      case AgentStatus.CONNECTING:
        return 'Connecting...';
      case AgentStatus.LISTENING:
        return 'Listening';
      case AgentStatus.THINKING:
        return 'Thinking';
      case AgentStatus.SPEAKING:
        return 'Speaking';
      case AgentStatus.ERROR:
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <>
      {/* Interview Report Modal */}
      {interviewReport && (
        <InterviewReport report={interviewReport} onClose={handleCloseReport} />
      )}

      {/* Generating Report Overlay */}
      {isGeneratingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Interview Report</h3>
            <p className="text-gray-600">Please wait while we analyze the interview...</p>
          </div>
        </div>
      )}

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`}></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Alex - AI Recruiter</h1>
                  <p className="text-sm text-gray-600">{getStatusText()}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Timer */}
              {isRecording && (
                <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-purple-900">{formatTime(recordingTime)}</span>
                </div>
              )}
              <div className="text-right">
                {company && <p className="text-sm font-semibold text-gray-900">{company}</p>}
                {jobRole && <p className="text-xs text-gray-600">{jobRole}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 w-full px-6 py-6">
        {/* Video Feed Section - Takes Most Space */}
        <div className="flex-1">
          <div className="sticky top-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-[calc(100vh-140px)]">
            <div className="relative h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-xl bg-gray-900"
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-white">Recording</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Note: Do not refresh the page or you'll lose the data.
            </div>
          </div>
        </div>

        {/* Chat Area - Smaller Sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-lg p-4 mb-4 border border-gray-100">
            {transcripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-500">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconAlex className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Chat with Alex</h3>
                  <p className="text-xs text-gray-600">
                    Start the interview to begin chatting
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {transcripts.map((entry, index) => (
                  <div key={index} className={`flex items-start gap-2 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {entry.speaker === 'agent' && (
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <IconAlex className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[200px] p-2.5 rounded-xl ${
                      entry.speaker === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="text-xs leading-relaxed">{entry.text}</p>
                    </div>
                    {entry.speaker === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
                          <IconUser className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
            {!isConnected ? (
              <button
                onClick={handleStartSession}
                disabled={agentStatus === AgentStatus.CONNECTING}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <IconMic className="w-4 h-4" />
                {agentStatus === AgentStatus.CONNECTING ? 'Connecting...' : 'Start Interview'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                  <p className="text-xs text-blue-800">
                    <strong>Interview in progress</strong>
                  </p>
                </div>
                <button
                  onClick={handleEndSession}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold text-sm hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <IconStop className="w-4 h-4" />
                  End Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

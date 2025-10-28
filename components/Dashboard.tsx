import React, { useState } from 'react';
import { AgentConfig } from '../types';

interface DashboardProps {
  agents: AgentConfig[];
  onCreateAgent: (agent: Omit<AgentConfig, 'id' | 'createdAt'>) => void;
  onDeleteAgent: (id: string) => void;
  onSelectAgent: (id: string) => void;
  selectedAgentId: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  agents,
  onCreateAgent,
  onDeleteAgent,
  onSelectAgent,
  selectedAgentId,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    jobRole: '',
    customQuestions: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.jobRole) {
      alert('Please fill in all required fields');
      return;
    }
    onCreateAgent(formData);
    setFormData({
      name: '',
      company: '',
      jobRole: '',
      customQuestions: '',
    });
    setIsFormOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Interview Agent Dashboard</h1>
          <p className="text-gray-600">Create and manage AI interview agents for different roles</p>
        </div>

        {/* Create Agent Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Agent
          </button>
        </div>

        {/* Create Agent Form */}
        {isFormOpen && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Configure New Interview Agent</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Frontend Developer Interview"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="e.g., TechCorp Inc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Questions (Optional)
                </label>
                <textarea
                  name="customQuestions"
                  value={formData.customQuestions}
                  onChange={handleInputChange}
                  placeholder="Enter specific questions or topics you want the agent to cover..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Agent
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agent List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Yet</h3>
              <p className="text-gray-600">Create your first interview agent to get started</p>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all cursor-pointer hover:shadow-xl ${
                  selectedAgentId === agent.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                onClick={() => onSelectAgent(agent.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Company:</span> {agent.company}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Role:</span> {agent.jobRole}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAgent(agent.id);
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    title="Delete agent"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {agent.customQuestions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Custom Questions:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{agent.customQuestions}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {new Date(agent.createdAt).toLocaleDateString()}
                  </span>
                  {selectedAgentId === agent.id && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


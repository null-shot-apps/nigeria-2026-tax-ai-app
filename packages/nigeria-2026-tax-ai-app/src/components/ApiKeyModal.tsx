'use client';

import { useState } from 'react';
import { X, Key, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
}

export default function ApiKeyModal({ onClose, onSubmit }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Enhancement</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Enhanced AI Analysis</p>
                <p>
                  Use OpenAI GPT-4 or Anthropic Claude for more accurate tax classification 
                  with detailed reasoning based on Nigeria Tax Reform Law 2026.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  provider === 'openai'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">OpenAI</div>
                <div className="text-xs mt-1">GPT-4 Turbo</div>
              </button>
              <button
                type="button"
                onClick={() => setProvider('anthropic')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  provider === 'anthropic'
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Anthropic</div>
                <div className="text-xs mt-1">Claude 3.5</div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
            <p className="mt-2 text-xs text-gray-600">
              Your API key is used only for this analysis and is not stored.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">How to get an API key:</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              {provider === 'openai' ? (
                <>
                  <li>1. Visit <span className="font-mono">platform.openai.com</span></li>
                  <li>2. Sign up or log in to your account</li>
                  <li>3. Go to API Keys section</li>
                  <li>4. Create a new secret key</li>
                </>
              ) : (
                <>
                  <li>1. Visit <span className="font-mono">console.anthropic.com</span></li>
                  <li>2. Sign up or log in to your account</li>
                  <li>3. Go to API Keys section</li>
                  <li>4. Create a new API key</li>
                </>
              )}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Analyze with AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


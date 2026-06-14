import { getTokenUserId } from "../lib/auth";
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getExam, fetchQuizReview } from '../lib/api';

const ReviewAssessments = () => {
  const locator = useLocation();
  const navigate = useNavigate();
  const [quizReview, setQuizReview] = useState([]);
  const [details, setDetails] = useState({});

  // Load MathJax once for LaTeX rendering (supports both plain text and LaTeX)
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.MathJax) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.id = 'mathjax-cdn-loader';
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Enhanced component to render content from various editors (LaTeX, Rich Text, Plain Text)
  const EnhancedTextViewer = ({ content, inline = false, className }) => {
    const nodeRef = useRef(null);
    const [showRaw, setShowRaw] = useState(false);

    useEffect(() => {
      if (window.MathJax && nodeRef.current && !showRaw) {
        // Queue typesetting for this node only
        window.MathJax.typesetPromise([nodeRef.current]).catch(() => {});
      }
    }, [content, showRaw]);

    // Function to detect content type
    const detectContentType = (text) => {
      if (!text) return 'plain';
      
      const latexPatterns = [
        /\\[a-zA-Z]+{.*?}/g,
        /\$.*?\$/g,
        /\$\$.*?\$\$/g,
        /\\\(.*?\\\)/g,
        /\\\[.*?\\\]/g,
        /\\begin\{.*?\}.*?\\end\{.*?\}/gs,
        /\\frac\{.*?\}\{.*?\}/g,
        /\\sqrt\{.*?\}/g,
        /\\sum_\{.*?\}\^\{.*?\}/g,
        /\\int_\{.*?\}\^\{.*?\}/g,
      ];

      const richTextPatterns = [
        /\*\*.*?\*\*/g,
        /__.*?__/g,
        /\*.*?\*/g,
        /_.*?_/g,
        /```.*?```/gs,
        /`.*?`/g,
      ];

      if (latexPatterns.some(pattern => pattern.test(text))) {
        return '';
      } else if (richTextPatterns.some(pattern => pattern.test(text))) {
        return '';
      } else if (/<[^>]*>/.test(text)) {
        return '';
      }
      
      return 'plain';
    };

    // Function to detect and process different content types
    const processContent = (text) => {
      if (!text) return '';
      
      // First decode HTML entities
      let processedText = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');

      // Detect if content contains LaTeX patterns
      const latexPatterns = [
        /\\[a-zA-Z]+{.*?}/g,  // LaTeX commands with braces
        /\$.*?\$/g,           // Inline math
        /\$\$.*?\$\$/g,       // Display math
        /\\\(.*?\\\)/g,       // Inline math with \( \)
        /\\\[.*?\\\]/g,       // Display math with \[ \]
        /\\begin\{.*?\}.*?\\end\{.*?\}/gs, // LaTeX environments
        /\\frac\{.*?\}\{.*?\}/g, // Fractions
        /\\sqrt\{.*?\}/g,     // Square roots
        /\\sum_\{.*?\}\^\{.*?\}/g, // Sums
        /\\int_\{.*?\}\^\{.*?\}/g, // Integrals
      ];

      const hasLatex = latexPatterns.some(pattern => pattern.test(processedText));

      // If LaTeX is detected, ensure proper math delimiters
      if (hasLatex) {
        // Convert common LaTeX editor patterns to MathJax format
        processedText = processedText
          // Convert \( \) to $ $ for inline math
          .replace(/\\\(/g, '$')
          .replace(/\\\)/g, '$')
          // Convert \[ \] to $$ $$ for display math
          .replace(/\\\[/g, '$$')
          .replace(/\\\]/g, '$$')
          // Ensure single $ are properly escaped if not part of math
          .replace(/(?<!\\)\$(?!.*\$)/g, '\\$');
      }

      // Handle rich text formatting from text editors
      processedText = processedText
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Code blocks
        .replace(/```(.*?)```/gs, '<code class="block-code">$1</code>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Line breaks
        .replace(/\n/g, '<br />');

      return processedText;
    };

    // Function to safely render HTML content
    const renderContent = (text) => {
      const processedText = processContent(text);
      
      // If content contains HTML tags, render as HTML
      if (/<[^>]*>/.test(processedText)) {
        return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
      }
      
      // Otherwise render as plain text
      return processedText;
    };

    const contentType = detectContentType(content);
    const Tag = inline ? 'span' : 'div';
    
    // Get editor support information
    const getEditorSupport = (type) => {
      switch (type) {
        case 'latex':
          return 'Supports LaTeX editors (Overleaf, TeXstudio, etc.)';
        case 'richtext':
          return 'Supports rich text editors (Word, Google Docs, etc.)';
        case 'html':
          return 'Supports HTML editors and web-based editors';
        case 'plain':
          return 'Plain text format';
        default:
          return '';
      }
    };
    
    return (
      <div className="relative">
        {contentType !== 'plain' && (
          <div className="absolute -top-6 right-0 flex gap-2">
            <span className={`content-type-indicator content-type-${contentType}`}>
              {contentType.toUpperCase()}
            </span>
            {/* <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
              title={`Toggle ${showRaw ? 'formatted' : 'raw'} view`}
            >
              {showRaw ? 'Formatted' : 'Raw'}
            </button> */}
          </div>
        )}
        
        <Tag ref={nodeRef} className={className}>
          {showRaw ? (
            <pre className="text-xs bg-gray-100 p-2 rounded border overflow-x-auto">
              {content}
            </pre>
          ) : (
            renderContent(content)
          )}
        </Tag>
        
        {contentType !== 'plain' && (
          <div className="editor-support">
            <strong></strong> {getEditorSupport(contentType)}
          </div>
        )}
      </div>
    );
  };

  const quizId = locator?.state?.quizId;

  useEffect(() => {
    const loadQuizDetails = async () => {
      const response = await getExam(quizId);
      setDetails({ ...response.exam });
    };
    loadQuizDetails();
  }, []);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getTokenUserId();
        const response = await fetchQuizReview(userId, quizId);
        setQuizReview(response.review?.review);
      } catch (error) {
        console.error('Error fetching quiz review:', error);
      }
    };

    if (quizId) fetchAssessment();
  }, [quizId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 w-full overflow-auto">
      <style jsx>{`
        .block-code {
          display: block;
          background-color: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.75rem;
          margin: 0.5rem 0;
          font-family: 'Courier New', monospace;
          white-space: pre-wrap;
          overflow-x: auto;
        }
        
        code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
        }
        
        strong {
          font-weight: 600;
        }
        
        em {
          font-style: italic;
        }
        
        .math-display {
          display: block;
          text-align: center;
          margin: 1rem 0;
        }
        
        .math-inline {
          display: inline;
        }
        
        .content-type-indicator {
          position: absolute;
          top: -8px;
          left: 0;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          color: white;
          font-weight: 500;
        }
        
        .content-type-latex {
          background-color: #3b82f6;
        }
        
        .content-type-richtext {
          background-color: #10b981;
        }
        
        .content-type-html {
          background-color: #f59e0b;
        }
        
        .content-type-plain {
          background-color: #6b7280;
        }
        
        .editor-support {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #64748b;
        }
      `}</style>
      
      <div className="w-full pt-12 pb-4">
        <div className="w-full max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium"
          >
            ← Go Back
          </button>

          <h1 className="text-3xl font-bold text-blue-900 mb-6">Quiz Review</h1>

          {/* Enhanced Viewer Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            {/* <h2 className="text-lg font-semibold text-blue-900 mb-2">Enhanced Content Viewer</h2>
            <p className="text-blue-700 mb-3">
              This page now supports viewing content from various editors:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-900">LaTeX Editors:</strong>
                <ul className="list-disc list-inside text-blue-700 ml-2 mt-1">
                  <li>Overleaf</li>
                  <li>TeXstudio</li>
                  <li>TeXmaker</li>
                  <li>Any LaTeX editor</li>
                </ul>
              </div>
              <div>
                <strong className="text-blue-900">Text Editors:</strong>
                <ul className="list-disc list-inside text-blue-700 ml-2 mt-1">
                  <li>Microsoft Word</li>
                  <li>Google Docs</li>
                  <li>Markdown editors</li>
                  <li>Plain text editors</li>
                </ul>
              </div>
            </div>
            <p className="text-blue-600 text-sm mt-3">
              <strong>Tip:</strong> Use the "Raw" button to view the original content format, and look for content type indicators to see what editor format is being used.
            </p> */}
          </div>

          {!details.allowQuizReview ? (
            <p className="text-blue-700 text-lg">Review for this quiz is not allowed</p>
          ) : quizReview.length === 0 ? (
            <p className="text-blue-700 text-lg">Loading review...</p>
          ) : (
            <div className="space-y-6">
              {quizReview.map((item, index) => {
                const isCorrect = item.isCorrect;
                return (
                  <div
                    key={index}
                    className={`border p-4 rounded-xl shadow-sm ${
                      isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="font-semibold text-blue-900 mb-2">
                      <span>Question {index + 1}: </span>
                      <EnhancedTextViewer content={item.question} inline />
                    </div>

                    {item.image && (
                      <div className="mb-4">
                        <img
                          src={item.image}
                          alt={`Question ${index + 1}`}
                          className="w-full max-w-md rounded-lg border border-gray-200 shadow-sm"
                        />
                      </div>
                    )}

                    {Array.isArray(item.options) && item.options.length > 0 && (
                      <div className="mb-3">
                        <div className="font-medium text-blue-900">Options:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {item.options.map((opt, optIdx) => (
                            <li key={optIdx} className="text-blue-900">
                              <EnhancedTextViewer content={opt} inline />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mb-1">
                      <strong>Your Answer:</strong>{' '}
                      <span
                        className={
                          isCorrect
                            ? 'text-green-700 font-semibold'
                            : 'text-red-700 font-semibold'
                        }
                      >
                        <EnhancedTextViewer content={item.selectedAnswer || 'No answer'} inline />
                      </span>
                    </div>
                    <div className="mb-1">
                      <strong>Correct Answer:</strong>{' '}
                      <span className="text-green-700 font-semibold">
                        <EnhancedTextViewer content={item.correctAnswer} inline />
                      </span>
                    </div>
                    {item.explanation && (
                      <div>
                        <strong>Explanation:</strong>{' '}
                        <EnhancedTextViewer content={item.explanation} inline />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewAssessments;
 
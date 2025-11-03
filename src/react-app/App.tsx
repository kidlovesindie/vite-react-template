// src/App.tsx

import React, { useState, useMemo } from 'react';

// --- Hardcoded Prompt Data ---
// In a real application, you might fetch this from an API or a database.
const promptData = [
  {
    category: 'Marketing',
    prompts: [
      {
        id: 'mkt-1',
        title: 'Generate Ad Copy',
        description: 'Create compelling ad copy for a product launch.',
        template: 'Write 3 versions of ad copy for our new [Product Name]. The target audience is [Target Audience], and the key benefit we want to highlight is [Key Benefit]. The tone should be [Tone].',
      },
      {
        id: 'mkt-2',
        title: 'Blog Post Ideas',
        description: 'Brainstorm engaging blog post titles and outlines.',
        template: 'Generate 5 blog post ideas about [Topic]. The posts should be aimed at [Audience] and focus on solving [Specific Problem]. For each idea, provide a catchy title and a 3-point outline.',
      },
      {
        id: 'mkt-3',
        title: 'Social Media Campaign',
        description: 'Outline a social media campaign strategy.',
        template: 'Create a 1-week social media campaign plan for launching [Product/Service]. The campaign will run on [Social Media Platform(s)] and should target [Target Demographics]. Include daily post themes and a key call-to-action.',
      },
    ],
  },
  {
    category: 'Development',
    prompts: [
      {
        id: 'dev-1',
        title: 'Explain Code',
        description: 'Get a simple explanation of a complex code snippet.',
        template: 'Explain the following [Programming Language] code snippet like I\'m a [Experience Level] developer. Focus on [Specific Part of Code] and explain its purpose and how it works:\n\n```\n[Code Snippet]\n```',
      },
      {
        id: 'dev-2',
        title: 'Generate Regex',
        description: 'Create a regular expression for a specific pattern.',
        template: 'Write a regular expression that validates a [Pattern to Validate]. It should match cases like [Example of Match] but not [Example of Non-match].',
      },
      {
        id: 'dev-3',
        title: 'API Documentation',
        description: 'Draft documentation for a new API endpoint.',
        template: 'Write API documentation for a new endpoint: `[HTTP Method] /[endpoint-path]`. The endpoint is for [Endpoint Purpose]. Include details on required parameters ([Parameters]), a sample request body, and a sample successful response (200 OK).',
      },
    ],
  },
  {
    category: 'Creative Writing',
    prompts: [
      {
        id: 'cw-1',
        title: 'Story Starter',
        description: 'Generate an opening paragraph for a story.',
        template: 'Write the opening paragraph for a [Genre] story set in [Setting]. The main character is a [Character Archetype] who wants to [Character Goal].',
      },
      {
        id: 'cw-2',
        title: 'Character Profile',
        description: 'Create a detailed profile for a fictional character.',
        template: 'Develop a character profile for a [Role, e.g., protagonist, villain]. Their name is [Character Name], their main motivation is [Motivation], and their biggest fear is [Fear]. Include a brief physical description.',
      },
    ],
  },
];


// --- Helper Function ---
const extractPlaceholders = (template) => {
  const regex = /\[(.*?)\]/g;
  const matches = template.match(regex) || [];
  // Return unique placeholders
  return [...new Set(matches.map(p => p.slice(1, -1)))];
};

// --- SVG Icons ---
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ClipboardIcon = ({ copied }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {copied ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
    </svg>
);

// --- Main App Component ---
export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(promptData[0].category);
  const [selectedPrompt, setSelectedPrompt] = useState(promptData[0].prompts[0]);
  const [inputs, setInputs] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const placeholders = useMemo(() => selectedPrompt ? extractPlaceholders(selectedPrompt.template) : [], [selectedPrompt]);

  const finalPrompt = useMemo(() => {
    if (!selectedPrompt) return '';
    return placeholders.reduce((acc, placeholder) => {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      return acc.replace(regex, inputs[placeholder] || `[${placeholder}]`);
    }, selectedPrompt.template);
  }, [selectedPrompt, placeholders, inputs]);

  const handleInputChange = (placeholder, value) => {
    setInputs(prev => ({ ...prev, [placeholder]: value }));
  };

  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setInputs({}); // Reset inputs when a new prompt is selected
    if (sidebarOpen) {
        setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };
  
  const handleSelectCategory = (category) => {
      setSelectedCategory(category);
      // Select the first prompt of the new category
      const newCategoryData = promptData.find(c => c.category === category);
      if(newCategoryData && newCategoryData.prompts.length > 0) {
          handleSelectPrompt(newCategoryData.prompts[0]);
      } else {
          setSelectedPrompt(null);
      }
  }

  const copyToClipboard = () => {
    // Using document.execCommand as a fallback for iframe environments
    const textArea = document.createElement("textarea");
    textArea.value = finalPrompt;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textArea);
  };

  const Sidebar = () => (
     <aside className={`absolute md:relative z-20 md:z-auto w-64 md:w-1/4 lg:w-1/5 bg-zinc-950 h-full flex-shrink-0 transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-xl font-bold text-zinc-100">Prompt Library</h1>
                 <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-zinc-400 hover:text-zinc-100">
                    <CloseIcon />
                 </button>
            </div>
           
            <nav className="space-y-4">
                {promptData.map(({ category, prompts }) => (
                    <div key={category}>
                        <h2 
                            onClick={() => handleSelectCategory(category)}
                            className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2 cursor-pointer hover:text-emerald-500"
                        >
                            {category}
                        </h2>
                        <ul className="space-y-1">
                            {prompts.map(prompt => (
                                <li key={prompt.id}>
                                    <button
                                        onClick={() => handleSelectPrompt(prompt)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                                            selectedPrompt?.id === prompt.id
                                                ? 'bg-emerald-500 text-zinc-950 font-semibold'
                                                : 'text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                    >
                                        {prompt.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </div>
    </aside>
  );

  return (
    <div className="bg-zinc-100 font-sans text-zinc-900 flex h-screen overflow-hidden">
      <script src="https://cdn.tailwindcss.com"></script>
      <Sidebar />
      
      <main className="flex-1 flex flex-col w-full md:w-3/4 lg:w-4/5 overflow-y-auto">
        <header className="flex items-center justify-between p-4 border-b border-zinc-300">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-1 text-zinc-600">
                    <MenuIcon />
                </button>
                <div className="text-lg font-semibold text-zinc-800">{selectedPrompt?.title || 'Select a Prompt'}</div>
            </div>
        </header>

        {selectedPrompt ? (
            <div className="flex-1 p-6 md:p-8 lg:p-10 space-y-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-800 mb-2">{selectedPrompt.title}</h2>
                    <p className="text-zinc-600">{selectedPrompt.description}</p>
                </div>
                
                {/* Inputs Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold border-b border-zinc-200 pb-2">Customize</h3>
                    {placeholders.length > 0 ? (
                        placeholders.map(placeholder => (
                            <div key={placeholder}>
                                <label className="block text-sm font-medium text-zinc-700 mb-1" htmlFor={placeholder}>
                                    {placeholder}
                                </label>
                                {placeholder.toLowerCase().includes('snippet') || placeholder.toLowerCase().includes('body') ? (
                                    <textarea
                                        id={placeholder}
                                        value={inputs[placeholder] || ''}
                                        onChange={e => handleInputChange(placeholder, e.target.value)}
                                        rows="5"
                                        className="w-full p-2 border border-zinc-300 rounded-md bg-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        placeholder={`Enter ${placeholder}...`}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        id={placeholder}
                                        value={inputs[placeholder] || ''}
                                        onChange={e => handleInputChange(placeholder, e.target.value)}
                                        className="w-full p-2 border border-zinc-300 rounded-md bg-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        placeholder={`Enter ${placeholder}...`}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                       <p className="text-zinc-500 text-sm">This prompt has no customizable fields.</p>
                    )}
                </div>

                {/* Output Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Final Prompt</h3>
                        <button 
                            onClick={copyToClipboard}
                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-200 ${
                                copied ? 'bg-green-600 hover:bg-green-700' : 'bg-emerald-500 hover:bg-emerald-600'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
                        >
                            <ClipboardIcon copied={copied} />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <div className="p-4 bg-zinc-200 rounded-lg whitespace-pre-wrap text-sm text-zinc-800 min-h-[150px]">
                      {finalPrompt}
                    </div>
                </div>
            </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Please select a prompt from the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
}



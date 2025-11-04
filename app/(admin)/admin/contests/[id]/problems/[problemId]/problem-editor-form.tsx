'use client';

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/utils/supabase/client'; // Import the new client helper
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type TestCase = {
  input: string;
  output: string;
};

// The component receives the initial problem data and the server action as props
export default function ProblemEditorForm({ problem, action }: { problem: any; action: (formData: FormData) => void }) {
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Controlled component states
  const [title, setTitle] = useState(problem.title || '');
  const [description, setDescription] = useState(problem.description || '');
  const [constraints, setConstraints] = useState(problem.constraints || '');
  const [sampleInput, setSampleInput] = useState(problem.sample_input || '');
  const [sampleOutput, setSampleOutput] = useState(problem.sample_output || '');
  const [difficulty, setDifficulty] = useState(problem.difficulty || 'Easy');

  const [testCases, setTestCases] = useState<TestCase[]>(
    problem.problem_test_cases
      .filter((tc: any) => tc.is_hidden)
      .map((tc: any) => ({ input: tc.input, output: tc.expected_output }))
  );
  
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const addTestCase = () => { setTestCases([...testCases, { input: '', output: '' }]); };
  const removeTestCase = (index: number) => { setTestCases(testCases.filter((_, i) => i !== index)); };
  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index][field] = value;
    setTestCases(newTestCases);
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const filePath = `public/${problem.id}-${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('problem_images')
      .upload(filePath, file);

    if (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image.');
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('problem_images')
      .getPublicUrl(data.path);

    const markdownImage = `\n![${file.name}](${publicUrl})\n`;
    const newDescription = description + markdownImage;
    setDescription(newDescription);
    
    // Focus and move cursor to the end of the textarea
    setTimeout(() => {
        descriptionRef.current?.focus();
        descriptionRef.current?.setSelectionRange(newDescription.length, newDescription.length);
    }, 100);

    setIsUploading(false);
    event.target.value = ''; // Reset file input
  };
  
  return (
    <>
      <form action={(formData) => startTransition(() => action(formData))} className="space-y-8">
        <input type="hidden" name="testCases" value={JSON.stringify(testCases)} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="constraints" value={constraints} />
        <input type="hidden" name="sampleInput" value={sampleInput} />
        <input type="hidden" name="sampleOutput" value={sampleOutput} />
        <input type="hidden" name="difficulty" value={difficulty} />

        {/* Main Details Section */}
        <div className="p-6 bg-card-bg border border-border-color rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-arena-mint">Main Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300">Problem Title</label>
                  <input type="text" id="title" required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2" />
              </div>
              <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300">Difficulty</label>
                  <select id="difficulty" required value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                  </select>
              </div>
          </div>
        </div>
        
        {/* Problem Statement Section */}
        <div className="p-6 bg-card-bg border border-border-color rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-arena-mint">Problem Statement</h3>
            <div>
              <label htmlFor="image-upload" className="cursor-pointer px-3 py-1.5 bg-arena-blue text-dark-bg text-sm font-bold rounded-md">
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </label>
              <input id="image-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} disabled={isUploading}/>
            </div>
          </div>
          <div className="space-y-4">
              <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">Question (Markdown)</label>
                  <textarea ref={descriptionRef} id="description" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2 font-mono"></textarea>
              </div>
               <div>
                  <label htmlFor="constraints" className="block text-sm font-medium text-gray-300">Constraints</label>
                  <textarea id="constraints" rows={6} value={constraints} onChange={(e) => setConstraints(e.target.value)} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2 font-mono"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label htmlFor="sampleInput" className="block text-sm font-medium text-gray-300">Sample Input</label>
                      <textarea id="sampleInput" rows={5} value={sampleInput} onChange={(e) => setSampleInput(e.target.value)} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2 font-mono"></textarea>
                  </div>
                  <div>
                      <label htmlFor="sampleOutput" className="block text-sm font-medium text-gray-300">Sample Output</label>
                      <textarea id="sampleOutput" rows={5} value={sampleOutput} onChange={(e) => setSampleOutput(e.target.value)} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2 font-mono"></textarea>
                  </div>
              </div>
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="p-6 bg-card-bg border border-border-color rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-arena-mint">Judge Test Cases (Hidden)</h3>
            <button type="button" onClick={addTestCase} className="px-3 py-1 bg-arena-blue text-dark-bg text-sm font-bold rounded-md">+ Add Test Case</button>
          </div>
          <div className="space-y-4">
            {testCases.map((tc, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-4 bg-dark-bg border border-border-color rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-400">Input #{index + 1}</label>
                  <textarea value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} rows={3} className="mt-1 w-full bg-slate-900 border-slate-700 rounded-md p-2 font-mono text-sm"></textarea>
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-400">Expected Output #{index + 1}</label>
                  <textarea value={tc.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} rows={3} className="mt-1 w-full bg-slate-900 border-slate-700 rounded-md p-2 font-mono text-sm"></textarea>
                  <button type="button" onClick={() => removeTestCase(index)} className="absolute top-0 right-0 -mt-1 -mr-1 text-red-400 hover:text-red-200 text-xs">&times;</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end items-center space-x-4">
          <button type="button" onClick={() => setIsPreviewOpen(true)} className="px-6 py-3 bg-card-bg border border-border-color text-white font-bold rounded-md hover:bg-slate-700">
            Preview Problem
          </button>
          <button type="submit" disabled={isPending || isUploading} className="px-8 py-3 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md disabled:opacity-50">
            {isPending ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card-bg w-full max-w-4xl h-[90vh] border border-border-color rounded-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-color">
              <h3 className="text-xl font-bold text-gray-100">Problem Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div className="p-8 overflow-y-auto">
                <article className="prose prose-invert prose-lg max-w-none prose-pre:bg-dark-bg prose-pre:border prose-pre:border-border-color">
                  <h1>{title}</h1>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                  
                  <h2>Constraints</h2>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{constraints}</ReactMarkdown>
                  
                  <h2>Sample Input</h2>
                  <pre><code>{sampleInput}</code></pre>
                  
                  <h2>Sample Output</h2>
                  <pre><code>{sampleOutput}</code></pre>
                </article>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// NOTE: To get nice prose styling for the markdown, you need the @tailwindcss/typography plugin.
// Run: `npm install -D @tailwindcss/typography`
// Then add `require('@tailwindcss/typography')` to the plugins array in your `tailwind.config.ts`.
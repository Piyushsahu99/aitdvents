import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Bold, Italic, List, ListOrdered, Link, Quote,
  Code, Eye, FileText, Heading1, Heading2
} from 'lucide-react';

interface EnhancedBlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function EnhancedBlogEditor({
  value,
  onChange,
  placeholder = 'Write your blog content here...',
}: EnhancedBlogEditorProps) {
  const [cursorPosition, setCursorPosition] = useState(0);

  const insertMarkdown = (prefix: string, suffix: string = '', placeholder: string = 'text') => {
    const textarea = document.getElementById('blog-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      const newPosition = start + prefix.length;
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition + selectedText.length);
    }, 10);
  };

  const formatButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('*', '*', 'italic text'),
    },
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertMarkdown('# ', '', 'Heading'),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertMarkdown('## ', '', 'Heading'),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertMarkdown('- ', '', 'List item'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertMarkdown('1. ', '', 'List item'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)', 'link text'),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertMarkdown('> ', '', 'quote'),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertMarkdown('`', '`', 'code'),
    },
  ];

  // Simple markdown to HTML preview
  const renderPreview = (text: string) => {
    let html = text
      // Headings
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>')
      // Code
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Lists
      .replace(/^\- (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Quotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">$1</blockquote>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div className="space-y-3">
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write" className="gap-2">
            <FileText className="h-4 w-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-3">
          {/* Formatting Toolbar */}
          <Card className="p-2">
            <div className="flex flex-wrap gap-1">
              {formatButtons.map((button, index) => {
                const Icon = button.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={button.action}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title={button.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Editor */}
          <Textarea
            id="blog-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] font-mono text-sm leading-relaxed resize-none"
            onSelect={(e: any) => setCursorPosition(e.target.selectionStart)}
          />

          {/* Markdown Guide */}
          <Card className="p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">
              Markdown Guide:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>**bold**</span>
              <span>*italic*</span>
              <span># Heading 1</span>
              <span>## Heading 2</span>
              <span>[link](url)</span>
              <span>`code`</span>
              <span>- bullet</span>
              <span>1. numbered</span>
              <span>&gt; quote</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6 min-h-[400px]">
            {value ? (
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nothing to preview yet</p>
                  <p className="text-sm mt-1">Start writing to see the preview</p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Word Count */}
      {value && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {value.trim().split(/\s+/).length} words • {value.length} characters
          </span>
          <span>
            ~{Math.max(1, Math.ceil(value.trim().split(/\s+/).length / 200))} min read
          </span>
        </div>
      )}
    </div>
  );
}

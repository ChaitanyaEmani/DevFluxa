import { MarkdownFormatter } from '@/components/tools/formatters/MarkdownFormatter';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function MarkdownFormatterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="Markdown Formatter" 
        description="Format and beautify Markdown text"
      />
      <ToolDescription 
        description="Our Markdown formatter helps you format and organize your Markdown text with proper structure. Make your Markdown more readable and maintainable."
      />
      <MarkdownFormatter />
    </div>
  );
}

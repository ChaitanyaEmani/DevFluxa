import { HtmlBeautifier } from '@/components/tools/formatters/HtmlBeautifier';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function HtmlBeautifierPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="HTML Beautifier" 
        description="Format and beautify HTML code with proper indentation"
      />
      <ToolDescription 
        description="Our HTML beautifier helps you format and organize your HTML code with proper indentation and structure. Make your HTML more readable and maintainable."
      />
      <HtmlBeautifier />
    </div>
  );
}

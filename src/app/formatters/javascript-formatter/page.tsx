import { JavaScriptFormatter } from '@/components/tools/formatters/JavaScriptFormatter';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function JavaScriptFormatterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="JavaScript Formatter" 
        description="Format and beautify JavaScript code with proper indentation"
      />
      <ToolDescription 
        description="Our JavaScript formatter helps you format and organize your JavaScript code with proper indentation and structure. Make your JavaScript more readable and maintainable."
      />
      <JavaScriptFormatter />
    </div>
  );
}

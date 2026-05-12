import { CssFormatter } from '@/components/tools/formatters/CssFormatter';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function CssFormatterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="CSS Formatter" 
        description="Format and beautify CSS code with proper indentation"
      />
      <ToolDescription 
        description="Our CSS formatter helps you format and organize your CSS code with proper indentation and structure. Make your CSS more readable and maintainable."
      />
      <CssFormatter />
    </div>
  );
}

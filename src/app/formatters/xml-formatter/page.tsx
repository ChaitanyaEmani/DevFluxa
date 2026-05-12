import { XmlFormatter } from '@/components/tools/formatters/XmlFormatter';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function XmlFormatterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="XML Formatter" 
        description="Format and beautify XML code with proper indentation"
      />
      <ToolDescription 
        description="Our XML formatter helps you format and organize your XML code with proper indentation and structure. Make your XML more readable and maintainable."
      />
      <XmlFormatter />
    </div>
  );
}

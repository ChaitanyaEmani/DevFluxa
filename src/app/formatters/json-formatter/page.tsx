import { JsonFormatter } from '@/components/tools/formatters/JsonFormatter';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function JsonFormatterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="JSON Formatter" 
        description="Format and validate JSON data with ease"
      />
      <ToolDescription 
        description="Our JSON formatter helps you format, validate, and beautify your JSON data. It provides syntax highlighting, error detection, and automatic formatting options."
      />
      <JsonFormatter />
    </div>
  );
}

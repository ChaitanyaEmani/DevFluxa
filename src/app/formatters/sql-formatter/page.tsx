import { SqlFormatter } from '@/components/tools/formatters/SqlFormatter';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function SqlFormatterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="SQL Formatter" 
        description="Format and beautify SQL queries with proper indentation"
      />
      <ToolDescription 
        description="Our SQL formatter helps you format and organize your SQL queries with proper indentation and structure. Make your SQL more readable and maintainable."
      />
      <SqlFormatter />
    </div>
  );
}

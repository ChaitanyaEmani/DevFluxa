import { UuidGenerator } from '@/components/tools/other/UuidGenerator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function UuidGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="UUID Generator" 
        description="Generate unique UUIDs for your applications"
      />
      <ToolDescription 
        description="Our UUID generator creates unique identifiers using UUID v4 standard. Perfect for generating unique IDs for database records, session tokens, and other applications requiring unique identifiers."
      />
      <UuidGenerator />
    </div>
  );
}

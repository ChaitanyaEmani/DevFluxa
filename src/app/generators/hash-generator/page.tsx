import { HashGenerator } from '@/components/tools/other/HashGenerator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function HashGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="Hash Generator" 
        description="Generate various hash types for your data"
      />
      <ToolDescription 
        description="Our hash generator supports multiple hash algorithms including MD5, SHA-1, SHA-256, and more. Generate secure hashes for password storage, data verification, and security applications."
      />
      <HashGenerator />
    </div>
  );
}

import { PasswordGenerator } from '@/components/tools/other/PasswordGenerator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function PasswordGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="Password Generator" 
        description="Generate secure passwords with customizable options"
      />
      <ToolDescription 
        description="Our password generator helps you create strong, secure passwords with customizable length, character types, and complexity options. Keep your accounts safe with unique passwords."
      />
      <PasswordGenerator />
    </div>
  );
}

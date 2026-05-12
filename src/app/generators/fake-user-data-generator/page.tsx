import { FakeUserDataGenerator } from '@/components/tools/other/FakeUserDataGenerator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function FakeUserDataGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="Fake User Data Generator" 
        description="Generate realistic fake user data for testing"
      />
      <ToolDescription 
        description="Our fake user data generator creates realistic test data including names, emails, addresses, phone numbers, and more. Perfect for development, testing, and demo purposes without using real user information."
      />
      <FakeUserDataGenerator />
    </div>
  );
}

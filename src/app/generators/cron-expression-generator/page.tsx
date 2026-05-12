import { CronExpressionGenerator } from '@/components/tools/other/CronExpressionGenerator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function CronExpressionGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="Cron Expression Generator" 
        description="Generate and validate cron expressions for scheduling"
      />
      <ToolDescription 
        description="Our cron expression generator helps you create, validate, and understand cron expressions for job scheduling. Perfect for setting up automated tasks and cron jobs with an intuitive interface."
      />
      <CronExpressionGenerator />
    </div>
  );
}

import { MetaTagGenerator } from '@/components/tools/other/MetaTagGenerator';
import { ToolHeader } from '@/components/common/ToolHeader';
import { ToolDescription } from '@/components/common/ToolDescription';

export default function MetaTagGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title="Meta Tag Generator" 
        description="Generate SEO-friendly meta tags for your website"
      />
      <ToolDescription 
        description="Our meta tag generator helps you create comprehensive meta tags for better SEO. Generate title tags, descriptions, Open Graph tags, Twitter Cards, and more to improve your website's search engine visibility."
      />
      <MetaTagGenerator />
    </div>
  );
}

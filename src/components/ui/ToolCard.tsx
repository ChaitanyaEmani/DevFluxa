import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Tool } from '@/config/tools'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <div className="group relative bg-card rounded-lg border p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${tool.color}`}>
          <div className="h-6 w-6" />
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
          {tool.tag}
        </span>
      </div>
      
      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
        {tool.name}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {tool.description}
      </p>
      
      <Link 
        href={tool.path}
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        Open Tool
        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      
      {tool.popular && (
        <div className="absolute top-2 right-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
        </div>
      )}
    </div>
  )
}

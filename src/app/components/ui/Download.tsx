import { Download as DownloadIcon } from "lucide-react";

interface DownloadProps {
  content: string;
  filename: string;
  mimeType?: string;
  className?: string;
}

export function Download({ 
  content, 
  filename, 
  mimeType = 'text/plain', 
  className = "" 
}: DownloadProps) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${className}`}
    >
      <DownloadIcon className="h-4 w-4 mr-2" />
      Download
    </button>
  )
}

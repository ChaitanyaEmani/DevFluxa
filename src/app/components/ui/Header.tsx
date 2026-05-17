
export function Header({ toolTitle, toolDescription }: { toolTitle: string; toolDescription: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">{toolTitle}</h1>
      <p className="text-muted-foreground">
        {toolDescription}
      </p>
    </div>
  )
}

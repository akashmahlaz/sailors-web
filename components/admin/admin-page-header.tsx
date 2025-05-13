export interface AdminPageHeaderProps {
  title: string
  description: string
}

export function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

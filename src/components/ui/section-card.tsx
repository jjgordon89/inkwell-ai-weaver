
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  variant?: "default" | "compact" | "feature"
}

const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ className, title, description, icon, actions, children, variant = "default", ...props }, ref) => {
    const headerPadding = variant === "compact" ? "p-4 pb-2" : "p-6 pb-4"
    const contentPadding = variant === "compact" ? "px-4 pb-4" : "px-6 pb-6"
    
    return (
      <Card
        ref={ref}
        className={cn(
          "border border-border/50 shadow-sm bg-card/50 backdrop-blur-sm transition-colors hover:bg-card/80",
          variant === "feature" && "border-primary/20 bg-primary/5",
          className
        )}
        {...props}
      >
        {(title || description || icon || actions) && (
          <CardHeader className={cn(headerPadding, actions && "flex-row items-center justify-between space-y-0")}>
            <div className="flex items-center space-x-3">
              {icon && (
                <div className={cn(
                  "flex items-center justify-center rounded-lg",
                  variant === "feature" ? "w-10 h-10 bg-primary/10 text-primary" : "w-8 h-8 bg-muted text-muted-foreground"
                )}>
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className={cn(
                    "leading-none",
                    variant === "compact" ? "text-lg" : "text-xl"
                  )}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </CardHeader>
        )}
        <CardContent className={contentPadding}>
          {children}
        </CardContent>
      </Card>
    )
  }
)
SectionCard.displayName = "SectionCard"

export { SectionCard }

import React from 'react'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Bell, Check, AlertTriangle, Info, X } from 'lucide-react'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type OrderWithWebhookData = Database['public']['Tables']['orders']['Row']

interface WebhookNotificationProps {
  order: OrderWithWebhookData
  onDismiss?: (orderId: string) => void
  variant?: 'default' | 'compact'
  className?: string
}

/**
 * Component for displaying webhook notification events to users
 */
export function WebhookNotification({
  order,
  onDismiss,
  variant = 'default',
  className
}: WebhookNotificationProps) {
  const { toast } = useToast()
  
  // Parse the webhook status
  const status = order.last_webhook_status || 'none'
  const lastUpdated = order.last_webhook_timestamp 
    ? new Date(order.last_webhook_timestamp) 
    : null

  // Track if notification was dismissed locally (in addition to DB state)
  const [dismissed, setDismissed] = React.useState(order.notification_sent)
  
  // Return null if already dismissed
  if (dismissed || status === 'none') {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    
    if (onDismiss) {
      onDismiss(order.id)
    }
    
    toast({
      title: 'Notification dismissed',
      description: 'You won\'t see this notification again'
    })
  }

  // Determine alert variant and icon based on status
  let alertVariant: 'default' | 'destructive' = 'default'
  let isSuccess = false
  let icon = <Info className="h-4 w-4" />
  let title = 'Order Update'
  let description = 'Your order has been updated'
  
  // Set notification content based on webhook status
  switch (status) {
    case 'payment_completed':
      isSuccess = true
      icon = <Check className="h-4 w-4" />
      title = 'Payment Confirmed'
      description = 'Your payment has been processed successfully'
      break
      
    case 'payment_failed':
      alertVariant = 'destructive'
      icon = <AlertTriangle className="h-4 w-4" />
      title = 'Payment Failed'
      description = 'There was an issue with your payment. Please check your payment method.'
      break
      
    case 'ticket_delivered':
      isSuccess = true
      icon = <Check className="h-4 w-4" />
      title = 'Tickets Delivered'
      description = 'Your tickets have been delivered. Check your email or the "My Tickets" section.'
      break
      
    case 'order_processing':
      alertVariant = 'default'
      icon = <Bell className="h-4 w-4" />
      title = 'Order Processing'
      description = 'Your order is being processed. We\'ll notify you when it\'s complete.'
      break
      
    case 'order_cancelled':
      alertVariant = 'destructive'
      icon = <X className="h-4 w-4" />
      title = 'Order Cancelled'
      description = 'Your order has been cancelled.'
      break
      
    default:
      // Use defaults for unknown statuses
      if (status?.includes('fail') || status?.includes('error')) {
        alertVariant = 'destructive'
        icon = <AlertTriangle className="h-4 w-4" />
        title = 'Order Issue'
        description = 'There was an issue with your order. Please contact support.'
      }
  }
  
  // Render a compact version if requested
  if (variant === 'compact') {
    return (
      <div 
        className={cn(
          "flex items-center justify-between p-3 rounded-md",
          alertVariant === 'destructive' && "bg-destructive/15 text-destructive",
          isSuccess && "bg-emerald-50 text-emerald-700",
          alertVariant === 'default' && !isSuccess && "bg-muted",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    )
  }
  
  // Default full alert version
  return (
    <Alert 
      variant={alertVariant}
      className={cn("relative pr-8", className)}
    >
      {onDismiss && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDismiss}
          className="absolute right-1 top-1 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
      
      <div className="flex items-start gap-2">
        {icon}
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {description}
            {lastUpdated && (
              <div className="text-xs opacity-70 mt-1">
                {lastUpdated.toLocaleString()}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

/**
 * List of multiple webhook notifications
 */
export function WebhookNotificationList({
  orders,
  onDismiss,
  variant = 'default',
  className
}: {
  orders: OrderWithWebhookData[]
  onDismiss?: (orderId: string) => void
  variant?: 'default' | 'compact'
  className?: string
}) {
  // Filter orders to only those with webhook data and not dismissed
  const filteredOrders = orders.filter(order => 
    order.last_webhook_status && 
    !order.notification_sent
  )
  
  if (filteredOrders.length === 0) {
    return null
  }
  
  return (
    <div 
      className={cn(
        "space-y-2", 
        variant === 'compact' && "space-y-1",
        className
      )}
    >
      {filteredOrders.map(order => (
        <WebhookNotification
          key={order.id}
          order={order}
          onDismiss={onDismiss}
          variant={variant}
        />
      ))}
    </div>
  )
}

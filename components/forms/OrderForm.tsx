'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorRetry } from '@/components/ui/ErrorBoundary'
import { useAddPoints, useCreateOrder } from '@/lib/queries'
import { formatCurrency } from '@/lib/utils'

// Zod schema for order form validation
const OrderFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Sähköposti on pakollinen')
    .email('Anna kelvollinen sähköpostiosoite'),
  name: z
    .string()
    .min(2, 'Nimi tulee olla vähintään 2 merkkiä')
    .max(100, 'Nimi ei voi olla yli 100 merkkiä'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+358|0)[0-9]{8,9}$/.test(val.replace(/\s/g, '')), {
      message: 'Anna kelvollinen suomalainen puhelinnumero'
    }),
  items: z
    .array(z.object({
      productId: z.string().min(1),
      quantity: z.number().min(1, 'Määrä tulee olla vähintään 1'),
      price: z.number().min(0.01, 'Hinta tulee olla positiivinen')
    }))
    .min(1, 'Valitse vähintään yksi tuote'),
  shippingAddress: z.object({
    street: z.string().min(1, 'Katuosoite on pakollinen'),
    city: z.string().min(1, 'Kaupunki on pakollinen'),
    postalCode: z.string().min(5, 'Postinumero on pakollinen'),
    country: z.string().default('FI')
  }),
  qrCode: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'Sinun tulee hyväksyä käyttöehdot'
  })
})

type OrderFormData = z.infer<typeof OrderFormSchema>

interface OrderFormProps {
  initialData?: Partial<OrderFormData>
  onSubmit?: (data: OrderFormData) => void
  onSuccess?: (orderId: string) => void
  className?: string
}

export function OrderForm({ 
  initialData, 
  onSubmit, 
  onSuccess, 
  className 
}: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  
  const addPointsMutation = useAddPoints()
  const createOrderMutation = useCreateOrder()

  const form = useForm<OrderFormData>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      email: initialData?.email || '',
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      items: initialData?.items || [],
      shippingAddress: initialData?.shippingAddress || {
        street: '',
        city: '',
        postalCode: '',
        country: 'FI'
      },
      qrCode: initialData?.qrCode || '',
      agreeToTerms: false
    },
    mode: 'onChange' // Validate on change for better UX
  })

  const { formState: { errors, isValid, isDirty } } = form

  // Calculate total amount
  const totalAmount = React.useMemo(() => {
    return form.watch('items').reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [form.watch('items')])

  const handleSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)

      // Call custom onSubmit if provided
      if (onSubmit) {
        await onSubmit(data)
        return
      }

      // Create order
      const order = await createOrderMutation.mutateAsync({
        userId: undefined, // Will be determined by email
        email: data.email,
        items: data.items,
        totalAmount,
        shippingAddress: data.shippingAddress
      })

      // Add loyalty points if QR code provided
      if (data.qrCode) {
        await addPointsMutation.mutateAsync({
          orderId: order.id,
          email: data.email,
          amount: totalAmount,
          qrCode: data.qrCode,
          source: 'qr'
        })
      }

      // Call success callback
      onSuccess?.(order.id)

    } catch (error) {
      console.error('Order submission error:', error)
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Tilauksen lähettäminen epäonnistui. Yritä uudelleen.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSubmitError(null)
    form.handleSubmit(handleSubmit)()
  }

  return (
    <div className={className}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">
            Asiakastiedot
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...form.register('email')}
              label="Sähköposti *"
              type="email"
              placeholder="asiakas@example.com"
              error={errors.email?.message}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
            
            <Input
              {...form.register('name')}
              label="Nimi *"
              placeholder="Etunimi Sukunimi"
              error={errors.name?.message}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </div>
          
          <Input
            {...form.register('phone')}
            label="Puhelinnumero"
            type="tel"
            placeholder="+358 40 123 4567"
            error={errors.phone?.message}
            helperText="Valinnainen - käytetään toimituksen yhteydenottoon"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
        </div>

        {/* QR Code Bonus */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">
            Bonus-pisteet
          </h3>
          
          <Input
            {...form.register('qrCode')}
            label="QR-koodi (valinnainen)"
            placeholder="Skannaa QR-koodi saadaksesi bonus-pisteitä"
            error={errors.qrCode?.message}
            helperText="Skannaa QR-koodi saadaksesi 1.5x bonus-pisteitä tilauksestasi"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            }
          />
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">
            Toimitusosoite
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                {...form.register('shippingAddress.street')}
                label="Katuosoite *"
                placeholder="Esimerkkikatu 123"
                error={errors.shippingAddress?.street?.message}
              />
            </div>
            
            <Input
              {...form.register('shippingAddress.postalCode')}
              label="Postinumero *"
              placeholder="00100"
              error={errors.shippingAddress?.postalCode?.message}
            />
            
            <Input
              {...form.register('shippingAddress.city')}
              label="Kaupunki *"
              placeholder="Helsinki"
              error={errors.shippingAddress?.city?.message}
            />
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              {...form.register('agreeToTerms')}
              type="checkbox"
              id="agreeToTerms"
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-[var(--color-fg-secondary)]">
              Hyväksyn{' '}
              <a 
                href="/terms" 
                className="text-[var(--color-accent)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                käyttöehdot
              </a>{' '}
              ja{' '}
              <a 
                href="/privacy" 
                className="text-[var(--color-accent)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                tietosuojaselosteen
              </a>
              *
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-[var(--color-error)]">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Yhteensä</span>
              <span className="text-[var(--color-accent)]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            
            {form.watch('qrCode') && (
              <div className="text-sm text-[var(--color-success)]">
                ✨ Saat {Math.floor(totalAmount * 3)} bonus-pistettä QR-koodista!
              </div>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <ErrorRetry 
            error={submitError}
            onRetry={handleRetry}
            title="Tilauksen lähettäminen epäonnistui"
          />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          disabled={!isValid || !isDirty || isSubmitting}
          fullWidth
          className="mt-6"
        >
          {isSubmitting ? 'Lähetetään...' : `Tilaa nyt - ${formatCurrency(totalAmount)}`}
        </Button>
      </form>
    </div>
  )
}

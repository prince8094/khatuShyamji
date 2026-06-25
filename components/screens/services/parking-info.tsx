"use client"
import { Icon } from '@/components/shared'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export function ParkingInfoScreen({ navigate }: { navigate?: (s: string) => void }) {
  const { t } = useLanguage()
  const parkingSpots = [
    { name: 'Lot A', available: 12, icon: 'CarFront' },
    { name: 'Lot B', available: 45, icon: 'CarFront' },
    { name: 'Lot C', available: 8, icon: 'CarFront' },
  ]
  return (
    <div className='space-y-6 pb-8'>
      <header className='flex items-center justify-between'>
        <h1 className='font-heading text-2xl font-bold text-foreground'>{t('Parking Info', 'पार्किंग जानकारी')}</h1>
        <span className='grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary'>
          <Icon name='SquareParking' className='size-6' />
        </span>
      </header>
      <ul className='grid gap-4 md:grid-cols-2'>
        {parkingSpots.map((p, i) => (
          <li key={i} className='flex items-center gap-4 rounded-3xl border border-border bg-card p-4'>
            <span className='grid size-10 place-items-center rounded-lg bg-primary/10 text-primary'>
              <Icon name={p.icon as any} className='size-6' />
            </span>
            <div className='flex-1'>
              <p className='font-heading font-bold text-foreground'>{t(p.name, p.name)}</p>
              <p className='text-xs text-muted-foreground'>{t('Available', 'उपलब्ध')}: {p.available}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

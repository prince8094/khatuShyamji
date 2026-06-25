"use client"
import { Icon } from '@/components/shared'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export function TrafficUpdatesScreen({ navigate }: { navigate?: (s: string) => void }) {
  const { t } = useLanguage()
  const updates = [
    { road: 'NH-148', status: 'Smooth', icon: 'Road' },
    { road: 'NH-52', status: 'Heavy traffic', icon: 'Road' },
    { road: 'State Highway 2', status: 'Accident, delays', icon: 'Road' },
  ]
  return (
    <div className='space-y-6 pb-8'>
      <header className='flex items-center justify-between'>
        <h1 className='font-heading text-2xl font-bold text-foreground'>{t('Traffic Updates', 'ट्रैफिक अपडेट')}</h1>
        <span className='grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary'>
          <Icon name='TrafficCone' className='size-6' />
        </span>
      </header>
      <ul className='grid gap-4 md:grid-cols-2'>
        {updates.map((u, i) => (
          <li key={i} className='flex items-center gap-4 rounded-3xl border border-border bg-card p-4'>
            <span className='grid size-10 place-items-center rounded-lg bg-primary/10 text-primary'>
              <Icon name={u.icon as any} className='size-6' />
            </span>
            <div className='flex-1'>
              <p className='font-heading font-bold text-foreground'>{t(u.road, u.road)}</p>
              <p className='text-xs text-muted-foreground'>{t(u.status, u.status)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

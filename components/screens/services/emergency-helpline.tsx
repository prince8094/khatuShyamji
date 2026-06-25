"use client"
import { Icon } from '@/components/shared'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export function EmergencyHelplineScreen({ navigate }: { navigate?: (s: string) => void }) {
  const { t } = useLanguage()
  const helplines = [
    { name: 'Medical', number: '108', icon: 'HeartPulse' },
    { name: 'Police', number: '100', icon: 'Siren' },
    { name: 'Fire', number: '101', icon: 'Fire' },
  ]
  return (
    <div className='space-y-6 pb-8'>
      <header className='flex items-center justify-between'>
        <h1 className='font-heading text-2xl font-bold text-foreground'>{t('Emergency Helpline', 'आपातकालीन हेल्पलाइन')}</h1>
        <span className='grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary'>
          <Icon name='Siren' className='size-6' />
        </span>
      </header>
      <ul className='grid gap-4 md:grid-cols-2'>
        {helplines.map((h, i) => (
          <li key={i} className='flex items-center gap-4 rounded-3xl border border-border bg-card p-4'>
            <span className='grid size-10 place-items-center rounded-lg bg-primary/10 text-primary'>
              <Icon name={h.icon as any} className='size-6' />
            </span>
            <div className='flex-1'>
              <p className='font-heading font-bold text-foreground'>{t(h.name, h.name)}</p>
              <p className='text-xs text-muted-foreground'>{h.number}</p>
            </div>
            <a href={`tel:${h.number}`} className='rounded-xl bg-gradient-to-r from-primary to-secondary px-3 py-1 text-xs font-bold text-white shadow hover:shadow-md'>
              {t('Call', 'कॉल')}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

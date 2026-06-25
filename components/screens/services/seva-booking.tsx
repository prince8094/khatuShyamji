" use client\
import { useState } from \react\
import { Icon } from \@/components/shared\
import { useLanguage } from \@/lib/contexts/LanguageContext\
import type { ScreenKey } from \@/lib/data\

export function SevaBookingScreen({ navigate }: { navigate: (s: ScreenKey) => void }) {
 const { t } = useLanguage()
 const [selectedSeva, setSelectedSeva] = useState(\\)
 const [date, setDate] = useState(\\)
 const [submitted, setSubmitted] = useState(false)

 const sevas = [
 { id: \seva-001\, name: \Shri Dhyan Seva\, hindi: \????? ????\, desc: \Morning meditation session\, price: \Free\ },
 { id: \seva-002\, name: \Annapurna Seva\, hindi: \?????????? ????\, desc: \Community meal distribution\, price: \Free\ },
 { id: \seva-003\, name: \Shyam Aarti Service\, hindi: \????? ???? ????\, desc: \Participate in evening aarti\, price: \Free\ },
 ]

 const handleSubmit = (e) => {
 e.preventDefault()
 setSubmitted(true)
 setTimeout(() => { setSubmitted(false); setSelectedSeva(\\); setDate(\\) }, 4000)
 }

 return (
 <div className=\space-y-5 p-4\>
 <section className=\rounded-2xl bg-gradient-to-br from-[#D97706] to-[#D4AF37] p-6 text-white shadow-lg\>
 <h1 className=\font-heading text-2xl font-bold\>{t(\Seva Booking\, \???? ??????\)}</h1>
 <p className=\mt-2 text-sm opacity-90\>{t(\Select a seva and date to book your spot.\, \???? ?? ???? ????? ?? ???? ????? ??? ????.\)}</p>
 </section>
 {submitted ? (
 <div className=\flex flex-col items-center gap-3 rounded-2xl bg-green-50 p-6 text-center text-green-700 shadow\>
 <Icon name=\CheckCircle\ className=\size-8\ />
 <h2 className=\font-heading text-lg font-bold\>{t(\Booking Confirmed!\, \?????? ?????? ???!\)}</h2>
 <p className=\text-sm\>{t(\Your seva reservation is confirmed.\, \???? ???? ?????? ?????? ?? ?? ??.\)}</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className=\space-y-4\>
 <div className=\space-y-2\>
 <label className=\block text-sm font-medium\ htmlFor=\seva-select\>{t(\Choose Seva\, \???? ?????\)}</label>
 <select id=\seva-select\ required value={selectedSeva} onChange={e=>setSelectedSeva(e.target.value)} className=\w-full rounded-lg border border-border bg-card p-2 text-foreground\>
 <option value=\\>{t(\Select a seva\, \???? ?????\)}</option>
 {sevas.map(s=>(
 <option key={s.id} value={s.id}>{t(s.name,s.hindi)} – {s.desc} ({s.price})</option>
 ))}
 </select>
 </div>
 <div className=\space-y-2\>
 <label className=\block text-sm font-medium\ htmlFor=\date\>{t(\Date\, \?????\)}</label>
 <input id=\date\ type=\date\ required value={date} onChange={e=>setDate(e.target.value)} className=\w-full rounded-lg border border-border bg-card p-2 text-foreground\/>
 </div>
 <button type=\submit\ className=\w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#D4AF37] py-2.5 font-heading text-sm font-bold text-white shadow-md hover:shadow-lg\>
 <Icon name=\CalendarCheck\ className=\size-4\ />
 {t(\Book Seva\, \???? ??? ????\)}
 </button>
 </form>
 )}
 </div>
 )
}

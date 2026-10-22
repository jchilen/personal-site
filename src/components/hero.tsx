import avatar from '@/assets/icenine_avatar.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Hero() {
  return (
    <section className="flex flex-col items-center pt-24 text-center">
      <Avatar className="mb-8 size-28 rounded-none outline-2 outline-offset-4 outline-primary">
        <AvatarImage
          src={avatar}
          alt="IceNine avatar"
          className="rounded-none"
        />
        <AvatarFallback className="rounded-none font-heading text-2xl">
          JC
        </AvatarFallback>
      </Avatar>

      <p className="font-heading text-xs font-semibold tracking-eyebrow text-foreground uppercase dark:text-primary">
        Software Developer
      </p>
      <span aria-hidden="true" className="mt-2 h-0.5 w-8 bg-primary" />

      <h1 className="mt-4 font-heading text-4xl font-semibold tracking-widest uppercase sm:text-6xl">
        Joe Chilen
      </h1>
      <p className="mt-2 font-heading text-sm tracking-eyebrow text-muted-foreground uppercase">
        IceNine
      </p>
    </section>
  )
}

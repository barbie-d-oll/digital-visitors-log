import Image from "next/image"
import OrganizationImage from '@/public/organizational-dashboard.png'

export default function ProductShowcase() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <h3 className="text-2xl font-bold">Everything happening at your organization. One dashboard.</h3>
        <p className="mt-2 text-muted-foreground">Real-time tracking, analytics, and management from a single place.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr] lg:grid-cols-[1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-enterprise-lg">
            <div className="grid grid-cols-[1fr_260px] gap-6">
              <div className="rounded-lg bg-background p-4">{/* large dashboard mock */}
                 <Image src={OrganizationImage} alt="organization-image"  className="rounded-2xl object-cover" />
                {/* <div className="h-56 rounded-md bg-surface" /> */}
              </div>
              <aside className="space-y-3">
                <div className="rounded-lg bg-surface p-3">✓ Real-time visitor tracking</div>
                {/* <div className="rounded-lg bg-surface p-3">✓ Multiple locations</div> */}
                <div className="rounded-lg bg-surface p-3">✓ Visitor analytics</div>
                <div className="rounded-lg bg-surface p-3">✓ Secure organization workspace</div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

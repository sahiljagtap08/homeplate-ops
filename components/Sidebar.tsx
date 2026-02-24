'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, CheckCircle, ShoppingCart, LayoutDashboard, ChefHat } from 'lucide-react'

const links = [
  { href: '/',                     label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/recipes',              label: 'Recipes',            icon: BookOpen },
  { href: '/dietary-conditions',   label: 'Dietary Conditions', icon: CheckCircle },
  { href: '/weekly-plan',          label: 'Weekly Plan',        icon: ShoppingCart },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-zinc-800 flex items-center gap-2.5">
        <ChefHat className="w-6 h-6 text-orange-400" />
        <span className="text-white font-semibold text-base tracking-tight">HomePlate Ops</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? 'bg-orange-500/15 text-orange-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-600">USDA FDC powered nutrition</p>
      </div>
    </aside>
  )
}

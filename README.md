# Routrix - Logistics Management System
## Frontend Developer Guide for Samarth

This guide is written specifically for you Samarth.
You do not need to know backend, APIs, or business logic.
This guide covers everything you need to work confidently on any page or component.
If you have any doubts at any point, reach out to Vamshi.

---

## Table of Contents
1. Project Overview
2. Tech Stack
3. Folder Structure
4. How Routing Works
5. How to Navigate to a Route in the Browser
6. How to Add a New Page
7. How to Create a Component
8. How to Integrate a Component into a Page
9. How to Add a New Section to an Existing Page
10. Data and Props - What You Need to Know
11. Tailwind CSS Rules
12. Golden Rules - Never Break These

---

## 1. Project Overview

Routrix is a logistics management system for a fleet business.
The system handles trip logging, client billing, vehicle tracking, and invoice generation.

Your job is to build the UI only.
Data will be passed to your components from hooks and services that Vamshi handles separately.
You focus purely on how things look and how users interact with them.

---

## 2. Tech Stack

- **Next.js** with TypeScript - handles routing and pages
- **Tailwind CSS v3** - handles all styling
- **React** - component model

> IMPORTANT: We are on Tailwind v3 not v4. If you use AI tools like Claude or Cursor to
> generate components, always tell them "use Tailwind v3 only". v4 has different syntax
> and will break things silently.

---

## 3. Folder Structure

```
routrix-v1/
│
├── app/                          # All pages live here
│   ├── (dashboard)/              # All main app pages are inside this group
│   │   ├── layout.tsx            # Sidebar and navbar wrapper for all dashboard pages
│   │   ├── page.tsx              # Dashboard home page
│   │   ├── trips/
│   │   │   ├── page.tsx          # All trips list page
│   │   │   └── new/
│   │   │       └── page.tsx      # Log new trip page
│   │   ├── clients/
│   │   │   ├── page.tsx          # All clients page
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Single client detail page
│   │   ├── vehicles/
│   │   │   └── page.tsx          # Vehicles page
│   │   ├── invoices/
│   │   │   ├── page.tsx          # All invoices page
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Single invoice page
│   │   └── balances/
│   │       └── page.tsx          # Balances summary page
│   │
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles - only Tailwind imports here
│
├── components/                   # SAMARTH OWNS THIS ENTIRELY
│   ├── ui/                       # Small reusable UI pieces (Button, Input, Modal etc)
│   ├── layout/                   # Sidebar, Navbar, PageWrapper
│   ├── trips/                    # All trip related sections
│   ├── clients/                  # All client related sections
│   ├── vehicles/                 # All vehicle related sections
│   ├── invoices/                 # All invoice related sections
│   ├── balances/                 # All balance related sections
│   └── dashboard/                # Dashboard specific sections
│
├── hooks/                        # VAMSHI OWNS - do not touch
├── services/                     # VAMSHI OWNS - do not touch
├── store/                        # VAMSHI OWNS - do not touch
├── utils/                        # VAMSHI OWNS - do not touch
└── types/                        # VAMSHI OWNS - do not touch
```

---

## 4. How Routing Works

Next.js uses file based routing. This means the file path inside the `app/` folder
becomes the URL in the browser automatically. You do not configure routes anywhere.

Here are the exact mappings:

| File Path | URL in Browser |
|---|---|
| app/(dashboard)/page.tsx | http://localhost:3000/ |
| app/(dashboard)/trips/page.tsx | http://localhost:3000/trips |
| app/(dashboard)/trips/new/page.tsx | http://localhost:3000/trips/new |
| app/(dashboard)/clients/page.tsx | http://localhost:3000/clients |
| app/(dashboard)/clients/[id]/page.tsx | http://localhost:3000/clients/123 |
| app/(dashboard)/vehicles/page.tsx | http://localhost:3000/vehicles |
| app/(dashboard)/invoices/page.tsx | http://localhost:3000/invoices |
| app/(dashboard)/invoices/[id]/page.tsx | http://localhost:3000/invoices/456 |
| app/(dashboard)/balances/page.tsx | http://localhost:3000/balances |

> Note: The `(dashboard)` folder name with brackets is a route group.
> It does NOT appear in the URL. It is just for organising files.
> The `[id]` folder name with square brackets means it is a dynamic route.
> It accepts any value in that position in the URL.

---

## 5. How to Navigate to a Route in the Browser

First make sure the dev server is running:

```bash
npm run dev
```

Then open your browser and go to `http://localhost:3000`

To go to trips page: `http://localhost:3000/trips`
To go to clients page: `http://localhost:3000/clients`
To go to a specific client: `http://localhost:3000/clients/1`
To go to new trip form: `http://localhost:3000/trips/new`

To add navigation links inside the UI use Next.js Link component like this:

```tsx
import Link from "next/link"

// Inside your component JSX
<Link href="/trips" className="text-blue-600 hover:underline">
  Go to Trips
</Link>
```

Never use a plain HTML `<a>` tag for internal navigation. Always use `<Link>` from Next.js.

---

## 6. How to Add a New Page

Say Vamshi tells you we need a new page for Reports at the URL `/reports`.

**Step 1:** Create the folder and file

```
app/(dashboard)/reports/page.tsx
```

**Step 2:** Add this boilerplate to the file

```tsx
export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
      {/* Add your sections here */}
    </div>
  )
}
```

**Step 3:** Go to `http://localhost:3000/reports` in your browser.
The page will appear automatically. No extra configuration needed.

**Step 4:** Create the components for that page inside `components/reports/` folder
and import them into the page. See Section 8 for how to do this.

---

## 7. How to Create a Component

All components live inside the `components/` folder.
Each component is in its own file.
Group related components in the right subfolder.

Here is the exact structure of a correct component:

```tsx
// components/trips/TripCard.tsx

interface TripCardProps {
  date: string
  route: string
  vehicleNumber: string
  amount: number
  status: string
}

export default function TripCard({
  date,
  route,
  vehicleNumber,
  amount,
  status
}: TripCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{date}</span>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {status}
        </span>
      </div>
      <p className="text-base font-semibold text-gray-800 mt-2">{route}</p>
      <p className="text-sm text-gray-500">{vehicleNumber}</p>
      <p className="text-lg font-bold text-blue-600 mt-3">₹{amount.toLocaleString()}</p>
    </div>
  )
}
```

Things to notice in the example above:
- The props are clearly defined with types at the top using an interface
- The component only uses Tailwind classes for styling
- No API calls, no data fetching, no business logic inside
- It just receives data and renders it

---

## 8. How to Integrate a Component into a Page

Once you have created a component, here is how you bring it into a page.

```tsx
// app/(dashboard)/trips/page.tsx

import TripCard from "@/components/trips/TripCard"
import TripFilters from "@/components/trips/TripFilters"
import TripTable from "@/components/trips/TripTable"

export default function TripsPage() {
  // Temporary dummy data for UI development
  // Vamshi will replace this with real data from hooks later
  const dummyTrips = [
    {
      date: "02-02-2026",
      route: "Medchal to Vijayawada",
      vehicleNumber: "TS15UC2297",
      amount: 14000,
      status: "Completed"
    },
    {
      date: "03-02-2026",
      route: "Medchal to Kakinada",
      vehicleNumber: "AP29LB9592",
      amount: 23000,
      status: "Completed"
    }
  ]

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">All Trips</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + Log New Trip
        </button>
      </div>

      {/* Filters Section */}
      <TripFilters />

      {/* Trips List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyTrips.map((trip, index) => (
          <TripCard
            key={index}
            date={trip.date}
            route={trip.route}
            vehicleNumber={trip.vehicleNumber}
            amount={trip.amount}
            status={trip.status}
          />
        ))}
      </div>

      {/* Full Table Section */}
      <TripTable trips={dummyTrips} />

    </div>
  )
}
```

The `@/` in the import path means it starts from the root of the project.
So `@/components/trips/TripCard` means `routrix-v1/components/trips/TripCard.tsx`.

---

## 9. How to Add a New Section to an Existing Page

Say the trips page already exists and Vamshi tells you to add a summary stats bar at the top.

**Step 1:** Create the new component

```
components/trips/TripStatsSummary.tsx
```

```tsx
// components/trips/TripStatsSummary.tsx

interface TripStatsSummaryProps {
  totalTrips: number
  totalAmount: number
  pendingBalance: number
}

export default function TripStatsSummary({
  totalTrips,
  totalAmount,
  pendingBalance
}: TripStatsSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Total Trips</p>
        <p className="text-2xl font-bold text-gray-800">{totalTrips}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Total Amount</p>
        <p className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">Pending Balance</p>
        <p className="text-2xl font-bold text-red-500">₹{pendingBalance.toLocaleString()}</p>
      </div>
    </div>
  )
}
```

**Step 2:** Import and place it in the page

```tsx
// app/(dashboard)/trips/page.tsx

import TripStatsSummary from "@/components/trips/TripStatsSummary"
import TripCard from "@/components/trips/TripCard"

export default function TripsPage() {
  return (
    <div className="p-6 flex flex-col gap-6">

      {/* NEW SECTION added at top */}
      <TripStatsSummary
        totalTrips={24}
        totalAmount={344600}
        pendingBalance={719875}
      />

      {/* Rest of the page continues below */}
      ...

    </div>
  )
}
```

That is it. Just create the component and drop it into the page where you want it.

---

## 10. Data and Props - What You Need to Know

While you are building UI, Vamshi has not connected real data yet.
So use dummy hardcoded data inside the page file directly for now.

Here is the workflow between you and Vamshi:

```
You build component with props defined clearly
         ↓
Vamshi sees the props interface you defined
         ↓
Vamshi connects real data from hooks and passes it to your component
         ↓
Component renders real data automatically, zero changes needed from you
```

This is why defining props clearly at the top of every component is critical.
The clearer your props interface, the easier it is for Vamshi to wire data in.

**Two types of props you will use:**

1. Data props - information to display

```tsx
interface ClientCardProps {
  name: string
  totalDue: number
  lastTripDate: string
}
```

2. Callback props - actions the user takes

```tsx
interface TripFormProps {
  onSubmit: (data: any) => void    // called when user submits the form
  onCancel: () => void             // called when user clicks cancel
  isLoading: boolean               // Vamshi controls this to show spinner
}
```

Never call fetch() or axios inside a component. If a button click needs to do
something with data, just call the onSubmit or onAction prop that Vamshi passes in.

---

## 11. Tailwind CSS Rules

**We use Tailwind v3. This is non-negotiable.**

When using AI tools to generate components always say:
"Generate this using Tailwind CSS v3 only, no inline styles, no CSS modules"

**Rules:**

- Use only Tailwind utility classes for all styling
- No inline styles ever: `style={{ color: 'red' }}` is not allowed
- No `<style>` tags inside components
- No CSS modules (.module.css files)
- Use `gap-` for spacing between flex or grid children
- Use `p-` and `px-` and `py-` for padding
- Use `rounded-xl` or `rounded-lg` for cards and buttons consistently
- Use `shadow-sm` for subtle card shadows

**Common patterns to stay consistent:**

```tsx
// Card container
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">

// Page wrapper
<div className="p-6 flex flex-col gap-6">

// Primary button
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">

// Secondary button
<button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">

// Section heading
<h1 className="text-2xl font-bold text-gray-800">

// Subheading
<h2 className="text-lg font-semibold text-gray-700">

// Label text
<p className="text-sm text-gray-500">

// Amount display
<p className="text-xl font-bold text-blue-600">
```

---

## 12. Golden Rules - Never Break These

1. Never touch anything inside `hooks/`, `services/`, `store/`, `utils/`, `types/`
   Those folders belong to Vamshi entirely.

2. Never call fetch() or axios or any API inside a component.
   All data comes in through props.

3. Never use inline styles. Tailwind only.

4. One component per file. No exceptions.

5. Every component must have its props defined using an interface at the top.

6. Always use `<Link>` from Next.js for navigation, never `<a>` tags.

7. Never use Tailwind v4 syntax. If AI generates `@import "tailwindcss"` anywhere,
   delete it and tell Vamshi.

8. Place components in the correct subfolder.
   Trip related components go in `components/trips/`.
   Client related components go in `components/clients/`.
   And so on.

9. When in doubt about where something goes or how data flows, ask Vamshi before
   writing the code. Five minutes of alignment saves hours of rework.

---

## Quick Reference Card

| I want to... | I should... |
|---|---|
| See the dashboard | Go to http://localhost:3000 |
| See the trips page | Go to http://localhost:3000/trips |
| Add a new page | Create a page.tsx inside app/(dashboard)/pagename/ |
| Add a new section | Create component in components/ and import it in the page |
| Add a navigation link | Use Next.js Link component with href |
| Style something | Use Tailwind v3 utility classes only |
| Handle a button click that needs data | Use a callback prop, never fetch directly |
| Ask about data shape | Check the types/ folder or ask Vamshi |
| Run the project | npm run dev in the terminal |
| Something is broken | Ask Vamshi before spending too long debugging |

---

*Built by Vamshi. UI by Samarth. Let's ship it.*
```
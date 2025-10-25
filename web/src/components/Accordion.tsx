import type { ReactNode } from 'react'
import { useState } from 'react'

export interface AccordionItemProps {
  title: string
  content: ReactNode
}

export interface AccordionProps {
  items: AccordionItemProps[]
  allowMultiple?: boolean
  defaultOpenIndexes?: number[]
}

export function Accordion({ items, allowMultiple = false, defaultOpenIndexes = [] }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(defaultOpenIndexes)

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
      )
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]))
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleItem(index)
    }
  }

  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index)

        return (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => toggleItem(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
            >
              <span className="font-medium text-gray-900">{item.title}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div id={`accordion-content-${index}`} className="px-4 py-3 bg-white">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
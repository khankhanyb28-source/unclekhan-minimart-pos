"use client"

import React from "react"

type Props = {
  lines: string[]
}

export default function ReceiptPreview({ lines }: Props) {
  return (
    <div className="receipt-preview thermal-receipt">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (/^[-]{3,}$/.test(trimmed)) {
          return (
            <div key={idx} className="receipt-line divider">
              {/* empty divider */}
            </div>
          )
        }

        if (line.startsWith(" ") && trimmed.length > 0 && trimmed.length <= 32) {
          return (
            <div key={idx} className="receipt-line center">
              {trimmed}
            </div>
          )
        }

        const match = line.match(/^(\S.*?)\s{2,}(\S.*)$/)
        if (match) {
          return (
            <div key={idx} className={`receipt-line ${/^(TOTAL|CHANGE|PAYMENT)\b/i.test(match[1]) ? "total" : ""}`}>
              <span className="left">{match[1]}</span>
              <span className="right">{match[2]}</span>
            </div>
          )
        }

        return (
          <div key={idx} className={`receipt-line ${trimmed.length <= 32 ? "center" : ""}`}>
            {trimmed}
          </div>
        )
      })}
    </div>
  )
}

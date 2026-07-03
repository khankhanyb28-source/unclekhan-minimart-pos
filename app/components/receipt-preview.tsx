"use client"

import React from "react"

type Props = {
  lines: string[]
}

export default function ReceiptPreview({ lines }: Props) {
  return (
    <div className="receipt-preview thermal-receipt">
      {lines.map((line, idx) => {
        if (/^[-]{3,}$/.test(line.trim())) {
          return (
            <div key={idx} className="receipt-line divider">
              {/* empty divider */}
            </div>
          )
        }

        const match = line.match(/^(.*?)\s{2,}(.*?)$/)
        if (match) {
          return (
            <div key={idx} className={`receipt-line ${/^\s*TOTAL\b|^\s*CHANGE\b|^\s*PAYMENT\b/i.test(match[1]) ? "total" : ""}`}>
              <span className="left">{match[1]}</span>
              <span className="right">{match[2]}</span>
            </div>
          )
        }

        return (
          <div key={idx} className={`receipt-line ${line.trim().length <= 32 ? "center" : ""}`}>
            {line}
          </div>
        )
      })}
    </div>
  )
}

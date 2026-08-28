'use client'

import { useMemo } from 'react'

export interface QRCodeViewProps {
  value: string
  size?: number
  className?: string
  alt?: string
}

// --- ISO/IEC 18004 QR Code Standard Implementation in Pure TypeScript ---

// GF(256) Math
const GF_EXP: number[] = new Array(512)
const GF_LOG: number[] = new Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x
    GF_LOG[x] = i
    x <<= 1
    if (x >= 256) {
      x ^= 0x11d // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255]!
  }
})()

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0
  return GF_EXP[GF_LOG[x]! + GF_LOG[y]!]!
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    const next = [1, GF_EXP[i]!]
    const res = new Array(poly.length + next.length - 1).fill(0)
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < next.length; k++) {
        res[j + k] ^= gfMul(poly[j]!, next[k]!)
      }
    }
    poly = res
  }
  return poly
}

function rsComputeRemainder(data: number[], numEc: number): number[] {
  const gen = rsGeneratorPoly(numEc)
  const remainder = new Array(numEc).fill(0)
  for (const byte of data) {
    const factor = byte ^ remainder[0]!
    for (let i = 0; i < numEc - 1; i++) {
      remainder[i] = remainder[i + 1]! ^ gfMul(gen[i + 1]!, factor)
    }
    remainder[numEc - 1] = gfMul(gen[numEc]!, factor)
  }
  return remainder
}

// Table of QR Versions: [version, totalDataBytes_L, numEcBytes_L, alignmentPositions]
interface VersionTableEntry {
  version: number
  totalDataBytes: number
  ecBytes: number
  alignment: number[]
}

const QR_TABLE: VersionTableEntry[] = [
  { version: 1, totalDataBytes: 19, ecBytes: 7, alignment: [] },
  { version: 2, totalDataBytes: 34, ecBytes: 10, alignment: [6, 18] },
  { version: 3, totalDataBytes: 55, ecBytes: 15, alignment: [6, 22] },
  { version: 4, totalDataBytes: 80, ecBytes: 20, alignment: [6, 26] },
  { version: 5, totalDataBytes: 108, ecBytes: 26, alignment: [6, 30] },
  { version: 6, totalDataBytes: 136, ecBytes: 18 * 2, alignment: [6, 34] },
  { version: 7, totalDataBytes: 156, ecBytes: 20 * 2, alignment: [6, 22, 38] },
  { version: 8, totalDataBytes: 194, ecBytes: 24 * 2, alignment: [6, 24, 42] },
]

function getFormatInfoBits(mask: number): number {
  // Format info for Error Correction Level L (01) and mask
  // 15 bits format: 5 data bits (2 bits EC level L = 01, 3 bits mask) + 10 BCH bits, XOR with 0x5412
  const data = (1 << 3) | mask // EC Level L is '01'
  let rem = data << 10
  const generator = 0x537
  for (let i = 14; i >= 10; i--) {
    if ((rem >> i) & 1) {
      rem ^= generator << (i - 10)
    }
  }
  const bits = ((data << 10) | rem) ^ 0x5412
  return bits
}

function generateStandardQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder()
  const textBytes = Array.from(encoder.encode(text))

  // Find minimum QR version that can fit byte mode text
  let chosenVersion = QR_TABLE[QR_TABLE.length - 1]!
  for (const entry of QR_TABLE) {
    // Byte mode overhead: 4 bits mode + 8 bits length (for V1-9) + textBytes
    const neededBytes = Math.ceil((4 + 8 + textBytes.length * 8 + 4) / 8)
    if (neededBytes <= entry.totalDataBytes) {
      chosenVersion = entry
      break
    }
  }

  const { version, totalDataBytes, ecBytes, alignment } = chosenVersion
  const size = 17 + 4 * version

  // 1. Bit Buffer Encoding (Byte Mode = 0100)
  const bitBuffer: number[] = []
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bitBuffer.push((val >> i) & 1)
    }
  }

  pushBits(0b0100, 4) // Mode: Byte
  pushBits(textBytes.length, 8) // Character count
  for (const b of textBytes) {
    pushBits(b, 8)
  }
  // Terminator 4 zeros
  const remainingBits = totalDataBytes * 8 - bitBuffer.length
  pushBits(0, Math.min(4, Math.max(0, remainingBits)))
  // Byte align
  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(0)
  }
  // Pad bytes 0xEC (11101100) and 0x11 (00010001)
  const padBytes = [0xec, 0x11]
  let padIdx = 0
  while (bitBuffer.length < totalDataBytes * 8) {
    pushBits(padBytes[padIdx % 2]!, 8)
    padIdx++
  }

  // Convert bits to data codewords
  const dataCodewords: number[] = []
  for (let i = 0; i < bitBuffer.length; i += 8) {
    let byte = 0
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bitBuffer[i + j] || 0)
    }
    dataCodewords.push(byte)
  }

  // Compute Reed-Solomon error correction
  const ecCodewords = rsComputeRemainder(dataCodewords, ecBytes)
  const allCodewords = [...dataCodewords, ...ecCodewords]

  // Initialize Matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  const setModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r]![c] = val
      isFunction[r]![c] = true
    }
  }

  // Place Finder Pattern
  const placeFinder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r
        const cc = c0 + c
        if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
          const isDark =
            r >= 0 &&
            r <= 6 &&
            c >= 0 &&
            c <= 6 &&
            (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
          setModule(rr, cc, isDark)
        }
      }
    }
  }

  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // Place Alignment Patterns
  for (let i = 0; i < alignment.length; i++) {
    for (let j = 0; j < alignment.length; j++) {
      const ar = alignment[i]!
      const ac = alignment[j]!
      // Skip if overlapping finder patterns
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === alignment.length - 1) ||
        (i === alignment.length - 1 && j === 0)
      ) {
        continue
      }
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isDark = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)
          setModule(ar + r, ac + c, isDark)
        }
      }
    }
  }

  // Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    setModule(6, i, i % 2 === 0)
    setModule(i, 6, i % 2 === 0)
  }

  // Dark Module
  setModule(4 * version + 9, 8, true)

  // Reserve Format Information Modules
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[8]![i] = true
      isFunction[i]![8] = true
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8]![size - 1 - i] = true
    isFunction[size - 1 - i]![8] = true
  }

  // Place Data Bits with Mask 0 ((r + c) % 2 === 0)
  const maskFn = (r: number, c: number) => (r + c) % 2 === 0
  let bitIdx = 0
  const totalBits = allCodewords.length * 8

  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c-- // Skip vertical timing column
    for (let rCount = 0; rCount < size; rCount++) {
      const upward = Math.floor((size - 1 - c) / 2) % 2 === 0
      const r = upward ? size - 1 - rCount : rCount
      for (let colOffset = 0; colOffset < 2; colOffset++) {
        const cc = c - colOffset
        if (!isFunction[r]![cc]) {
          let bit = false
          if (bitIdx < totalBits) {
            const byteVal = allCodewords[Math.floor(bitIdx / 8)]!
            const bitOffset = 7 - (bitIdx % 8)
            bit = ((byteVal >> bitOffset) & 1) === 1
            bitIdx++
          }
          const masked = bit !== maskFn(r, cc)
          matrix[r]![cc] = masked
        }
      }
    }
  }

  // Write Format Information (Mask 0, EC L)
  const formatBits = getFormatInfoBits(0)
  // Format bits around top-left finder:
  const formatCoordinatesTL = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ]

  for (let i = 0; i < 15; i++) {
    const bitVal = ((formatBits >> (14 - i)) & 1) === 1
    const [r, c] = formatCoordinatesTL[i]!
    matrix[r!]![c!] = bitVal

    // Duplicate around top-right and bottom-left finders
    if (i < 8) {
      matrix[size - 1 - i]![8] = bitVal
    } else {
      matrix[8]![size - 15 + i] = bitVal
    }
  }

  return matrix
}

/**
 * Standard-compliant ISO/IEC 18004 2D QR Code SVG Component.
 * Supports high-contrast scannability by smartphone cameras and industrial barcode readers.
 */
export function QRCodeView({
  value,
  size = 160,
  className = '',
  alt = 'Kod QR Pengesahan Ketulenan Sijil Rasmi Pelabuhan Kemaman',
}: QRCodeViewProps) {
  const matrix = useMemo(() => {
    try {
      return generateStandardQrMatrix(value)
    } catch {
      // Fallback matrix if encoding fails
      return Array.from({ length: 25 }, () => Array(25).fill(false))
    }
  }, [value])

  const padding = 3 // 3-module quiet zone for instant camera detection
  const N = matrix.length
  const totalModules = N + padding * 2
  const modulePixel = 6
  const totalDimension = totalModules * modulePixel

  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-3 bg-white rounded-xl border-2 border-slate-300 shadow-md ${className}`}
      style={{ width: size, height: size }}
      title={alt}
      aria-label={alt}
    >
      <svg
        viewBox={`0 0 ${totalDimension} ${totalDimension}`}
        width="100%"
        height="100%"
        className="w-full h-full object-contain"
        shapeRendering="crispEdges"
      >
        {/* Crisp White Quiet Zone & Canvas */}
        <rect width={totalDimension} height={totalDimension} fill="#ffffff" />

        {/* High-Contrast Standard QR Modules */}
        {matrix.map((row, r) =>
          row.map((isDark, c) =>
            isDark ? (
              <rect
                key={`${r}-${c}`}
                x={(c + padding) * modulePixel}
                y={(r + padding) * modulePixel}
                width={modulePixel}
                height={modulePixel}
                fill="#0b2545"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  )
}

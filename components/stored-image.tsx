"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

interface StoredImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export function StoredImage({ src, alt, fill, className, width, height }: StoredImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("/placeholder.svg")

  useEffect(() => {
    // Use the source directly as it's now always a URL
    setImageSrc(src)
  }, [src])

  if (fill) {
    return <Image src={imageSrc || "/placeholder.svg"} alt={alt} fill className={className} />
  }

  return (
    <Image
      src={imageSrc || "/placeholder.svg"}
      alt={alt}
      width={width || 300}
      height={height || 300}
      className={className}
    />
  )
}


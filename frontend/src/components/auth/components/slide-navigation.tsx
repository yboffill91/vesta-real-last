"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

interface SlideNavigationProps {
  currentSlide: number
  totalSlides: number
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
}

export function SlideNavigation({ currentSlide, totalSlides, onPrev, onNext, onSelect }: SlideNavigationProps) {
  return (
    <>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <motion.button
            key={index}
            className={cn(
              "h-2 rounded-full transition-all",
              currentSlide === index ? "bg-white w-4" : "bg-white/50 w-2",
            )}
            onClick={() => onSelect(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
          onClick={onPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/20"
          onClick={onNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </motion.div>
    </>
  )
}

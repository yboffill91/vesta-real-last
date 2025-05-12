
"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { slides } from "./slide-content"
import { Slide } from "./slide"
import { SlideNavigation } from "./slide-navigation"

export function ImageSlider() {
  const [[currentSlide, direction], setSlide] = useState([0, 0])

  const nextSlide = () => {
    setSlide((prev) => [prev[0] === slides.length - 1 ? 0 : prev[0] + 1, 1])
  }

  const prevSlide = () => {
    setSlide((prev) => [prev[0] === 0 ? slides.length - 1 : prev[0] - 1, -1])
  }

  const goToSlide = (index: number) => {
    setSlide([index, currentSlide > index ? -1 : 1])
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <Slide key={currentSlide} slide={slides[currentSlide]} direction={direction} />
      </AnimatePresence>

      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={slides.length}
        onPrev={prevSlide}
        onNext={nextSlide}
        onSelect={goToSlide}
      />
    </div>
  )
}

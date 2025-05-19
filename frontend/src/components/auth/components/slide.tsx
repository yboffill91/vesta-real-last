"use client";

import { motion } from "framer-motion";
import type { SlideContent } from "./slide-content";
import Image from "next/image";
import { Card, CardContent, CardHeader, Separator } from "@/components/ui";

interface SlideProps {
  slide: SlideContent;
  direction: number;
}

// Variantes de animación para la diapositiva
const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

// Variantes de animación para el texto
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.5,
    },
  },
};

export function Slide({ slide, direction }: SlideProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="absolute inset-0"
    >
      <Image
        src={slide.image || "/placeholder.svg"}
        alt={slide.title}
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
        width={1000}
        height={1000}
      />
      <motion.div
        className="relative z-10 flex h-full items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={textVariants}
      >
        <Card className="bg-accent/80 backdrop-blur-sm container mx-auto max-w-2xl p-6">
          <CardHeader>
            <motion.h2
              className="text-3xl font-bold text-primary"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {slide.title}
            </motion.h2>
          </CardHeader>
          <Separator />
          <CardContent className="p-6">
            <motion.p
              className="text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {slide.description}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

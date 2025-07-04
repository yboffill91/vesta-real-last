"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ImageSlider, LoginForm } from "./components";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "../ui";

export default function LoginComponents() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-4 p-6 md:p-10 h-full ">
        <Card className="relative flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-card">
          <CardHeader>
            <span className="absolute top-0 right-0">
              <ThemeToggle />
            </span>

            <motion.div
              className="bg-primary pe-4 rounded-full text-primary-foreground ps-px py-px"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="#" className="flex items-center gap-2 font-medium">
                <motion.div
                  className="flex h-10 w-10 items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Image
                    src="/logo.webp"
                    alt="VestaSys Logo"
                    className="h-full w-full object-contain rounded-full bg-primary-foreground"
                    width={64}
                    height={64}
                  />
                </motion.div>
                <motion.span
                  className="text-xl font-semibold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  Vesta Manager
                </motion.span>
              </Link>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-xs">
                <LoginForm />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div>
              <p className="text-center text-[0.7rem] text-muted-foreground">
                {new Date().getFullYear()}&nbsp;Tecnotics Soluciones
                Integrales.&nbsp;Matanzas Cuba
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <ImageSlider />
      </div>
    </div>
  );
}

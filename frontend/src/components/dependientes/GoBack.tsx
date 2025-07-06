"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui";
import { ChevronLeft, Ghost } from "lucide-react";
export const GoBack = () => {
  const router = useRouter();
  return (
    <Button variant="ghost" size={"icon"} onClick={router.back}>
      <ChevronLeft />
    </Button>
  );
};

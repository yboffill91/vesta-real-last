import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./Card";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}
export const FormWrapper = ({ title, subtitle, children }: Props) => {
  return (
    <main className="container mx-auto py-6 space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
};

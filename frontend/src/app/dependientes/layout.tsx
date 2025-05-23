import { LogoutButton } from "@/components/ui";

const DependientesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen overflow-y-auto container max-w-7xl mx-auto p-2 rounded-lg border-2 shadow bg-background dark:bg-slate-950 ">
      <div className="flex flex-col items-center justify-between rounded-lg border h-full">
        {children}
        <div className="flex items-center gap-2 border-t rounded-t-lg border p-2 bg-card">
          <LogoutButton variant="default" />
        </div>
      </div>
    </div>
  );
};

export default DependientesLayout;

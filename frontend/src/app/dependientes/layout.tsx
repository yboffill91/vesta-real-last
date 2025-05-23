import { DependientesMenu } from "@/components/dependientes/DependientesMenu";

const DependientesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col h-screen overflow-y-auto container max-w-7xl mx-auto p-2 rounded-lg border-2 shadow bg-background dark:bg-slate-950 ">
      <div className="flex flex-col items-center rounded-lg border h-full relative">
        <DependientesMenu className="absolute top-0 right-0" />
        {children}
      </div>
    </div>
  );
};

export default DependientesLayout;

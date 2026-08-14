import { cn } from "@/lib/utils";

interface AsideProps {
  icon?: string;
  children?: React.ReactNode;
  type?: "default" | "warning" | "danger";
}

export function Aside({
  children,
  icon,
  type = "default",
  ...props
}: AsideProps) {
  return (
    <div
      className={cn(
        "flex border-5 py-3 px-4 ms-2 ms-md-0 my-10 rounded rounded-1 shadow",
        "bg-healing-mist/70 border-line/60 border-l-2 border-l-healing-blue"
      )}
      {...props}
    >
      <div className="rounded rounded-1 text-center h-8 w-8 bg-healing-blue/80 text-2xl relative top-[-30px] left-[-30px]">
        {icon || "💡"}
      </div>
      <div>{children}</div>
    </div>
  );
}

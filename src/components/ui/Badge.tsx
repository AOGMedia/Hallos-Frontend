interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "live" | "price" | "tag" | "notlive" | "success";
  className?: string;
}

export function Badge({
  children,
  variant = "tag",
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles = {
    live: "bg-primary/10 text-text-primary text-small px-3 py-2 rounded-full flex items-center gap-2 animate-pulse ",
    price:
      "bg-gradient-to-b from-[#3FB1D6] to-[#3FB1D6] text-white text-small font-bold px-4 py-2 rounded-full",
    tag: "bg-primary/10 text-primary text-base font-medium px-4 py-2 rounded-full hover:bg-primary/20 transition-colors cursor-pointer",
    notlive:
      "bg-primary/10 text-text-primary text-small px-3 py-2 rounded-full flex items-center gap-2",
    success:
      "bg-green-500/20 text-green-500 text-small font-bold px-4 py-2 rounded-full",
  };

  return (
    <span className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}

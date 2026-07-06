"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "./Button";
// import { Upload, Download, Video, PenSquare } from "lucide-react";

interface MenuItem {
  label: string ;
  icon: React.ElementType;
  onClick: () => void;
}

interface CreateDropdownProps {
  items: MenuItem[];
  buttonLabel?: string | React.ReactNode;
  position?: "bottom" | "right";
  onItemClick?: () => void;
}

export default function CreateDropdown({
  items,
  buttonLabel = "Create",
  position = "bottom",
  onItemClick,
}: CreateDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="primary"
        size="md"
        className="flex items-center gap-2 mr-4"
        onClick={() => {
          if (items.length === 1) {
            items[0].onClick();
            if (onItemClick) onItemClick();
          } else {
            setOpen(!open);
          }
        }}
      >
        {buttonLabel}
      </Button>

      {open && (
        <div
          className={`w-48 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-800/90
                     shadow-xl backdrop-blur-md border border-white/10 p-2 ${
                       position === "right"
                         ? "fixed left-[20px] -bottom-15"
                         : "absolute right-0 mt-3"
                     }`}
          style={{ zIndex: 9999 }}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.onClick();
                setOpen(false);
                if (onItemClick) onItemClick();
              }}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-xl text-gray-200
                         hover:bg-white/10 transition"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

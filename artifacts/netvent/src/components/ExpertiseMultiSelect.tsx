import { useState } from "react";
import { Check, ChevronsUpDown, X, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Expertise } from "@workspace/api-client-react";

const TEAL = "#3FA796";

interface ExpertiseMultiSelectProps {
  options: Expertise[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
}

export function ExpertiseMultiSelect({ options, value, onChange, max = 3 }: ExpertiseMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((o) => value.includes(o.id));
  const atMax = value.length >= max;

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (!atMax) {
      onChange([...value, id]);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-12 w-full justify-between font-normal text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 shrink-0 opacity-50" />
              {value.length > 0 ? `${value.length} selected (max ${max})` : `Select up to ${max} skills…`}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search skills…" />
            <CommandList>
              <CommandEmpty>No skill found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = value.includes(opt.id);
                  const disabled = !isSelected && atMax;
                  return (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      disabled={disabled}
                      onSelect={() => toggle(opt.id)}
                      className={cn(disabled && "opacity-40")}
                    >
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      {opt.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(63,167,150,0.1)", color: TEAL }}
            >
              {s.name}
              <button type="button" onClick={() => toggle(s.id)} className="hover:opacity-70" aria-label={`Remove ${s.name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import collegesData from "../../data/colleges.json";

type CollegeInputProps = {
  value: string;
  onChange?: (value: { label: string; value: string }) => void;
}

export default function CollegeInput({ onChange, value: startVal }: CollegeInputProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(collegesData[startVal] ?? "");

  const colleges = Object.entries(collegesData).map(([label, value]) => ({
    label,
    value,
  }));

  const selectedLabel = colleges.find((c) => c.value === value)?.label;

  const handleSelect = (collegeValue: { label: string; value: string }) => {
    setValue(collegeValue.value);
    setOpen(false);
    if (onChange) onChange(collegeValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          className="w-full hover:bg-neutral-100 h-10 border border-slate-300 flex justify-start items-center rounded-md pl-4"
        >
          {selectedLabel || "Select a college..."}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-white">
        <Command >
          <CommandInput placeholder="Search colleges..." />
          <CommandList className="max-h-60 overflow-y-auto bg-white">
            {colleges.map((college) => (
              <CommandItem
                key={college.value}
                onSelect={() => handleSelect(college)}
                className="bg-white hover:bg-neutral-100 cursor-pointer"
              >
                {college.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

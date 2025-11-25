import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 Days</SelectItem>
        <SelectItem value="30">Last 30 Days</SelectItem>
        <SelectItem value="90">Last 90 Days</SelectItem>
        <SelectItem value="180">Last 6 Months</SelectItem>
      </SelectContent>
    </Select>
  );
}

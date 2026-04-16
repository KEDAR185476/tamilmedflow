import { useDistrictFilter, DISTRICT_OPTIONS } from "@/hooks/useDistrictFilter";
import { MapPin } from "lucide-react";

export function DistrictSelector() {
  const { selectedDistrict, setSelectedDistrict } = useDistrictFilter();

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-primary" />
      <select
        value={selectedDistrict}
        onChange={(e) => setSelectedDistrict(e.target.value)}
        className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
      >
        {DISTRICT_OPTIONS.map(opt => (
          <option key={opt.id} value={opt.id} className="bg-background text-foreground">
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

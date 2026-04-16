/**
 * District Filter Context
 * Global district selector that updates all dashboard widgets
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { TN_DISTRICTS } from "@/data/districts";

interface DistrictFilterContextType {
  selectedDistrict: string; // "all" or district id
  setSelectedDistrict: (id: string) => void;
  districtName: string;
}

const DistrictFilterContext = createContext<DistrictFilterContextType>({
  selectedDistrict: "all",
  setSelectedDistrict: () => {},
  districtName: "Tamil Nadu (All Districts)",
});

export function DistrictFilterProvider({ children }: { children: ReactNode }) {
  const [selectedDistrict, setSelected] = useState("all");

  const setSelectedDistrict = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const districtName = selectedDistrict === "all"
    ? "Tamil Nadu (All Districts)"
    : TN_DISTRICTS.find(d => d.id === selectedDistrict)?.name ?? selectedDistrict;

  return (
    <DistrictFilterContext.Provider value={{ selectedDistrict, setSelectedDistrict, districtName }}>
      {children}
    </DistrictFilterContext.Provider>
  );
}

export function useDistrictFilter() {
  return useContext(DistrictFilterContext);
}

export const DISTRICT_OPTIONS = [
  { id: "all", name: "Tamil Nadu (All)" },
  ...TN_DISTRICTS.map(d => ({ id: d.id, name: d.name })),
];

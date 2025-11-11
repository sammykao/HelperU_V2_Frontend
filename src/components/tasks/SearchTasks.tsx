import { Dispatch, SetStateAction, useState } from "react";
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { TaskSearchRequest } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SearchTasksProps = {
  handleSearch: (e: React.FormEvent) => void;
  searchParams: TaskSearchRequest
  setSearchParams: Dispatch<SetStateAction<TaskSearchRequest>>;
}

export function SearchTasks({ handleSearch, searchParams, setSearchParams }: SearchTasksProps) {
  const [isSearchSettingsOpen, setIsSearchSettingsOpen] = useState<boolean>(false);

  const handleFilterChange = (key: keyof TaskSearchRequest, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, search_offset: 0 }));
  };

  return (
    <form className='flex flex-col gap-y-4 w-full h-full px-2 py-4 gap-x-3 mb-2 rounded-xl' onSubmit={(e) => handleSearch(e)}>
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 sm:gap-x-2">
        <div className="flex-1 flex flex-col">
          <label
            htmlFor="search"
            className="text-xs sm:text-sm font-medium text-gray-700 mb-1"
          >
            Search Criteria
          </label>
          <input
            id="search"
            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Babysitting, Furniture Moving, etc..."
            onChange={(e) => handleFilterChange("search_query", e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48 flex flex-col">
          <label
            htmlFor="zipcode"
            className="text-xs sm:text-sm font-medium text-gray-700 mb-1"
          >
            Search Zipcode
          </label>
          <input
            id="zipcode"
            className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Your Location"
            value={searchParams.search_zip_code}
            onChange={(e) => handleFilterChange("search_zip_code", e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-x-2 self-stretch sm:self-end">
          <button className="bg-blue-500 px-3 sm:px-4 py-2 sm:py-3 text-white rounded-lg sm:rounded-xl transition-all active:scale-95 text-sm sm:text-base flex-1 sm:flex-none" onClick={handleSearch} type="submit">
            Search
          </button>
          <button
            className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl transition-all active:scale-95 flex flex-row gap-x-2 items-center justify-center text-sm sm:text-base flex-1 sm:flex-none"
            onClick={() => setIsSearchSettingsOpen(!isSearchSettingsOpen)}
            type="button"
          >
            <ChevronDown className={cn("w-4 h-4 transition-all duration-300", isSearchSettingsOpen ? "rotate-180" : "rotate-0")} />
            <span className="hidden sm:inline">Refine Search</span>
            <span className="sm:hidden">Filters</span>
          </button>
        </div>
      </div>

      {isSearchSettingsOpen && (
        <div className='w-full h-fit flex flex-col sm:flex-row gap-3 sm:gap-x-2'>
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="sortBy"
              className="text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Sort By
            </label>
            <Select value={searchParams.sort_by} onValueChange={(val) => handleFilterChange("sort_by", val)}>
              <SelectTrigger className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base h-full">
                <SelectValue id="sort_by" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300">
                <SelectGroup>
                  <SelectItem value="distance" className="hover:bg-slate-100 transition-all">Distance</SelectItem>
                  <SelectItem value="post_date" className="hover:bg-slate-100 transition-all">Post Date</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="locationType"
              className="text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Location Type
            </label>
            <Select value={searchParams.search_location_type} onValueChange={(val) => handleFilterChange("search_location_type", val)}>
              <SelectTrigger className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base h-full">
                <SelectValue placeholder="All Locations" id="locationType" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300">
                <SelectGroup>
                  <SelectItem value="remote" className="hover:bg-slate-100 transition-all">Remote</SelectItem>
                  <SelectItem value="in_person" className="hover:bg-slate-100 transition-all">In Person</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="minRate"
              className="text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Min Rate ($/hr)
            </label>
            <input
              id="minRate"
              type="number"
              min={1}
              value={searchParams.min_hourly_rate}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="1"
              onChange={(e) => handleFilterChange("min_hourly_rate", e.target.value)}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="distance"
              className="text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Distance (miles)
            </label>
            <input
              type="number"
              id="distance"
              value={searchParams.distance_radius}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              onChange={(e) => handleFilterChange("distance_radius", e.target.value)}
            />
          </div>
        </div>
      )}
    </form>
  )
}

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Dispatch, SetStateAction } from "react";

type TaskDateSelctorProps = {
  dates: Date[],
  setDates: Dispatch<SetStateAction<Date[]>>;
}

export function TaskDateSelctor({ dates, setDates }: TaskDateSelctorProps) {
  const [date, setDate] = useState<Date>()

  useEffect(() => {
    if (!date) {
      return;
    }

    for (const savedDate of dates) {
      if (date.toString() === savedDate.toString()) {
        return;
      }
    }

    setDates((prev) => [...prev, date])
  }, [date]);

  return (
    <Calendar
      mode="single"
      onSelect={setDate}
      className="rounded-lg shadow-sm bg-white w-fit"
      hidden={{ before: new Date() }}
      startMonth={new Date()}
    />
  )
}

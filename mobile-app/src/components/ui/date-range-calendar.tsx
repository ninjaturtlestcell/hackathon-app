import { useState } from "react";
import { useColorScheme } from "nativewind";
import { Calendar, type DateData } from "react-native-calendars";

import { Colors } from "@/constants/theme";

const ACCENT = "#6366f1";

type Range = { start?: string; end?: string };

function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  const cur = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cur <= last) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** react-native-calendars tabanli tarih araligi secici (mobil). */
export function DateRangeCalendar({
  onChange,
}: {
  onChange?: (range: Range) => void;
}) {
  const { colorScheme } = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [range, setRange] = useState<Range>({});

  function onDayPress(day: DateData) {
    const d = day.dateString;
    let next: Range;
    if (!range.start || range.end || d < range.start) {
      next = { start: d, end: undefined };
    } else {
      next = { start: range.start, end: d };
    }
    setRange(next);
    onChange?.(next);
  }

  const marked: Record<string, object> = {};
  if (range.start && !range.end) {
    marked[range.start] = {
      startingDay: true,
      endingDay: true,
      color: ACCENT,
      textColor: "#fff",
    };
  } else if (range.start && range.end) {
    const days = eachDay(range.start, range.end);
    days.forEach((ds) => {
      marked[ds] = {
        color: ACCENT,
        textColor: "#fff",
        startingDay: ds === range.start,
        endingDay: ds === range.end,
      };
    });
  }

  return (
    <Calendar
      markingType="period"
      markedDates={marked}
      onDayPress={onDayPress}
      theme={{
        calendarBackground: colors.background,
        monthTextColor: colors.text,
        dayTextColor: colors.text,
        textDisabledColor: colors.textSecondary,
        textSectionTitleColor: colors.textSecondary,
        arrowColor: colors.text,
        todayTextColor: ACCENT,
      }}
    />
  );
}

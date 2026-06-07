import { useState } from "react";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  LocaleConfig,
  type DateData,
} from "react-native-calendars";

import { Colors } from "@/constants/theme";

const ACCENT = "#6366f1";

LocaleConfig.locales.en = {
  monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  monthNamesShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ],
  dayNames: [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ],
  dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  today: "Today",
};

LocaleConfig.locales.tr = {
  monthNames: [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ],
  monthNamesShort: [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz",
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
  ],
  dayNames: [
    "Pazar", "Pazartesi", "Salı", "Çarşamba",
    "Perşembe", "Cuma", "Cumartesi",
  ],
  dayNamesShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  today: "Bugün",
};

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
  const { i18n } = useTranslation();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  LocaleConfig.defaultLocale = i18n.resolvedLanguage === "tr" ? "tr" : "en";
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
      key={i18n.resolvedLanguage}
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

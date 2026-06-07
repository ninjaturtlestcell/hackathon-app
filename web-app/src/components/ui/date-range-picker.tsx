"use client";

import * as React from "react";
import { format } from "date-fns";
import { enUS, tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
};

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage === "tr" ? tr : enUS;
  const [internal, setInternal] = React.useState<DateRange | undefined>(value);
  const range = value ?? internal;

  function handleSelect(next: DateRange | undefined) {
    setInternal(next);
    onChange?.(next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-64 justify-start text-left font-normal",
            !range && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {range?.from ? (
            range.to ? (
              <>
                {format(range.from, "dd LLL y", { locale })} -{" "}
                {format(range.to, "dd LLL y", { locale })}
              </>
            ) : (
              format(range.from, "dd LLL y", { locale })
            )
          ) : (
            <span>{t("datePicker.rangePlaceholder")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={locale}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}

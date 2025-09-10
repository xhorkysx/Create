import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Plus, X } from "lucide-react";

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  hourlyRate: number;
  earnings: number;
  isHoliday?: boolean;
  isVacation?: boolean;
}

interface TimeEntryFormProps {
  onAddEntry: (
    entry: Omit<TimeEntry, "id" | "earnings">,
  ) => void;
  defaultHourlyRate: number;
}

export function TimeEntryForm({
  onAddEntry,
  defaultHourlyRate,
}: TimeEntryFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [hours, setHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState(
    defaultHourlyRate.toString(),
  );
  const [isHoliday, setIsHoliday] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hoursNum = parseFloat(hours);
    const rateNum = isHoliday ? 450 : parseFloat(hourlyRate);

    if (
      !hoursNum ||
      hoursNum <= 0 ||
      !rateNum ||
      rateNum <= 0
    ) {
      alert("Prosím zadejte platné hodnoty pro hodiny a sazbu");
      return;
    }

    onAddEntry({
      date,
      hours: hoursNum,
      hourlyRate: rateNum,
      isHoliday,
    });

    // Reset form
    setHours("");
    setIsHoliday(false);
    setIsExpanded(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-center">
          {!isExpanded ? (
            <Button 
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Přidat záznam
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <CardTitle>Přidat nový záznam</CardTitle>
              <Button 
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Zrušit
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Počet hodin</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="8"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">
                  Hodinová sazba (Kč)
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="250"
                  value={isHoliday ? "450" : hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  disabled={isHoliday}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Checkbox
                id="isHoliday"
                checked={isHoliday}
                onCheckedChange={(checked) => setIsHoliday(checked as boolean)}
              />
              <Label htmlFor="isHoliday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Práce ve svátek (450 Kč/h)
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Uložit záznam
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Zrušit
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AirtablePackage } from "@/lib/airtable";
import { formatCurrency } from "@/lib/utils";

interface BookingFormProps {
  packages: AirtablePackage[];
  preselectedPackageId?: string;
  blockedDates?: Date[];
}

type Step = 1 | 2 | 3;

export function BookingForm({ packages, preselectedPackageId, blockedDates = [] }: BookingFormProps) {
  const [step, setStep]         = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name:      "",
      email:     "",
      phone:     "",
      packageId: preselectedPackageId ?? "",
      notes:     "",
    },
  });

  const packageId = useWatch({ control: form.control, name: "packageId" });
  const selectedPkg = packages.find((p) => p.id === packageId);

  const onSubmit = async (data: BookingInput) => {
    setError(null);
    try {
      const payload = {
        ...data,
        sessionDate:  selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
        packageName:  selectedPkg?.name,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border border-[#C4A882] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#C4A882] text-xl">✓</span>
        </div>
        <h2 className="font-serif text-3xl mb-4">
          Thank you, {form.getValues("name").split(" ")[0]}.
        </h2>
        <p className="text-[#6B6860] max-w-sm mx-auto leading-relaxed">
          I&apos;ve received your booking request and will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  const inputClass = "w-full border-b border-[#E8E4DF] bg-transparent py-3 text-sm text-[#1A1A18] placeholder-[#6B6860]/50 focus:outline-none focus:border-[#C4A882] transition-colors";
  const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-2";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {/* Progress bar */}
      <div className="flex gap-1 mb-12">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-0.5 flex-1 transition-colors",
              step >= s ? "bg-[#C4A882]" : "bg-[#E8E4DF]"
            )}
          />
        ))}
      </div>

      {/* Step 1 — Package selection */}
      {step === 1 && (
        <div className="space-y-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#6B6860] mb-1">Step 1 of 3</p>
            <h2 className="font-serif text-2xl">Choose a package</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages.map((pkg) => {
              const selected = packageId === pkg.id;
              return (
                <label
                  key={pkg.id}
                  className={cn(
                    "flex flex-col p-5 border cursor-pointer transition-all",
                    selected
                      ? "border-[#C4A882] bg-[#C4A882]/5"
                      : "border-[#E8E4DF] hover:border-[#C4A882]/50"
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={pkg.id}
                    {...form.register("packageId")}
                  />
                  <span className="font-medium text-sm">{pkg.name}</span>
                  <span className="text-[#C4A882] text-lg font-light mt-1">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-[#6B6860] text-xs mt-1">
                    {Math.floor(pkg.duration / 60)}h {pkg.duration % 60 ? `${pkg.duration % 60}m` : ""}
                  </span>
                </label>
              );
            })}
            {/* Flexible option */}
            <label
              className={cn(
                "flex flex-col p-5 border cursor-pointer transition-all",
                packageId === ""
                  ? "border-[#C4A882] bg-[#C4A882]/5"
                  : "border-[#E8E4DF] hover:border-[#C4A882]/50"
              )}
            >
              <input
                type="radio"
                className="sr-only"
                value=""
                {...form.register("packageId")}
              />
              <span className="font-medium text-sm">Not sure yet</span>
              <span className="text-[#6B6860] text-xs mt-2">I&apos;ll discuss details via email</span>
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A18] text-white hover:bg-[#C4A882] transition-colors"
            >
              Continue <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Date selection */}
      {step === 2 && (
        <div className="space-y-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#6B6860] mb-1">Step 2 of 3</p>
            <h2 className="font-serif text-2xl">Choose a date</h2>
            <p className="text-[#6B6860] text-sm mt-2">Select a preferred date — I&apos;ll confirm availability within 24 hours.</p>
          </div>
          <div className="w-full max-w-sm mx-auto">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={[{ before: new Date() }, ...blockedDates]}
              showOutsideDays
              classNames={{
                root:            "w-full text-sm select-none",
                months:          "w-full",
                month:           "w-full space-y-3",
                month_caption:   "flex items-center justify-between px-1 mb-2",
                caption_label:   "text-sm font-medium text-[#1A1A18] tracking-wide",
                nav:             "flex items-center gap-1",
                button_previous: "p-1.5 text-[#6B6860] hover:text-[#1A1A18] transition-colors",
                button_next:     "p-1.5 text-[#6B6860] hover:text-[#1A1A18] transition-colors",
                month_grid:      "w-full border-collapse",
                weekdays:        "flex",
                weekday:         "flex-1 text-center text-[10px] tracking-widest uppercase text-[#6B6860] pb-2",
                week:            "flex w-full mt-1",
                day:             "flex-1 text-center p-0",
                day_button:      cn(
                  "w-full aspect-square flex items-center justify-center text-sm text-[#1A1A18]",
                  "hover:bg-[#F5F0EB] transition-colors cursor-pointer"
                ),
                selected:        "!bg-[#C4A882] !text-white",
                today:           "font-semibold text-[#C4A882]",
                outside:         "opacity-30",
                disabled:        "opacity-20 cursor-not-allowed",
                hidden:          "invisible",
              }}
            />
          </div>
          {selectedDate && (
            <div className="flex items-center gap-2 text-sm text-[#6B6860]">
              <Calendar size={14} className="text-[#C4A882]" />
              Selected: <strong className="text-[#1A1A18]">{format(selectedDate, "MMMM d, yyyy")}</strong>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
            <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 text-xs tracking-widest uppercase px-6 py-3 bg-[#1A1A18] text-white hover:bg-[#C4A882] transition-colors">
              Continue <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Contact info */}
      {step === 3 && (
        <div className="space-y-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#6B6860] mb-1">Step 3 of 3</p>
            <h2 className="font-serif text-2xl">Your details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...form.register("name")} placeholder="Jane Smith" className={inputClass} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input {...form.register("email")} type="email" placeholder="jane@example.com" className={inputClass} />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input {...form.register("phone")} type="tel" placeholder="+1 555 000 0000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Preferred Location</label>
              <input {...form.register("location")} placeholder="Studio, outdoor, your home..." className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Tell me about your vision</label>
            <textarea {...form.register("notes")} rows={4} placeholder="Share any ideas, inspiration, or questions..." className={`${inputClass} resize-none`} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 text-xs text-[#6B6860] hover:text-[#1A1A18] transition-colors">
              <ChevronLeft size={14} /> Back
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex items-center gap-2 text-xs tracking-widest uppercase px-8 py-4 bg-[#1A1A18] text-white hover:bg-[#C4A882] transition-colors disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "Sending..." : "Submit Request"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

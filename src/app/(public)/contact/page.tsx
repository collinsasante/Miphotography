"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { Mail, Phone, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", message: "", type: "General" as const },
  });

  const onSubmit = async (data: InquiryInput) => {
    setError(null);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  const inputClass = "w-full border-b border-[#E8E4DF] bg-transparent py-3 text-sm text-[#1A1A18] placeholder-[#6B6860]/50 focus:outline-none focus:border-[#C4A882] transition-colors";
  const labelClass = "block text-[10px] tracking-widest uppercase text-[#6B6860] mb-2";

  return (
    <div className="pt-24 sm:pt-36 md:pt-44 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#C4A882] mb-3">Get In Touch</p>
            <h1 className="font-serif text-4xl text-[#1A1A18] mb-6">Let&apos;s Talk</h1>
            <p className="text-[#6B6860] leading-relaxed mb-12">
              Whether you have a question about packages, availability, or just want to say hello — I&apos;d love to hear from you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-[#C4A882]" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6860] mb-1">Email</p>
                  <a href="mailto:Kissirichsmanuel3@gmail.com" className="text-sm text-[#1A1A18] hover:text-[#C4A882] transition-colors">
                    Kissirichsmanuel3@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-[#C4A882]" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6860] mb-1">Phone</p>
                  <a href="tel:+233538523381" className="text-sm text-[#1A1A18] hover:text-[#C4A882] transition-colors block">
                    0538523381
                  </a>
                  <a href="tel:+233205859006" className="text-sm text-[#1A1A18] hover:text-[#C4A882] transition-colors block">
                    0205859006
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-[#C4A882]" />
                </div>
                <div>
                  <p className="text-xs tracking-widest uppercase text-[#6B6860] mb-1">Response Time</p>
                  <p className="text-sm text-[#1A1A18]">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-start justify-center h-full">
                <div className="w-12 h-12 border border-[#C4A882] flex items-center justify-center mb-6">
                  <span className="text-[#C4A882] text-xl">✓</span>
                </div>
                <h2 className="font-serif text-2xl mb-3">Message sent.</h2>
                <p className="text-[#6B6860] text-sm leading-relaxed">
                  Thank you for reaching out. I&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
                {/* Type selector */}
                <div>
                  <label className={labelClass}>Inquiry Type</label>
                  <select {...form.register("type")} className={`${inputClass} cursor-pointer`}>
                    {["General", "Booking", "Pricing", "Gallery"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input {...form.register("name")} placeholder="Jane Smith" className={inputClass} />
                    {form.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input {...form.register("email")} type="email" placeholder="jane@example.com" className={inputClass} />
                    {form.formState.errors.email && <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Subject</label>
                  <input {...form.register("subject")} placeholder="How can I help?" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea {...form.register("message")} rows={5} placeholder="Tell me what's on your mind..." className={`${inputClass} resize-none`} />
                  {form.formState.errors.message && <p className="text-xs text-red-500 mt-1">{form.formState.errors.message.message}</p>}
                </div>

                {/* Honeypot */}
                <input type="text" name="_trap" className="hidden" tabIndex={-1} autoComplete="off" />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full py-4 bg-[#1A1A18] text-white text-xs tracking-widest uppercase hover:bg-[#C4A882] transition-colors disabled:opacity-60"
                >
                  {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

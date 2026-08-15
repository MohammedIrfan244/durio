"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitFeedback } from "@/server/actions/feedback-actions";
import { toast } from "sonner";
import { ChevronLeft, Send, CheckCircle2 } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackClient() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const res = await submitFeedback({
      subject,
      category,
      message,
      userEmail: userEmail,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setSubject("");
      setMessage("");
      setUserEmail("");
      setCategory("General");
    } else {
      toast.error(res.error || "Failed to send feedback");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft size={18} />
            Back
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground mt-2">
            Help us improve your experience with {APP_NAME}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-8 text-foreground">
                <section>
                  <p className="text-lg text-muted-foreground">
                    Found a bug? Have a feature request? Or just want to share your thoughts?
                    Fill out the form below and we&apos;ll get back to you.
                  </p>
                </section>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <section className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bug">Bug Report</SelectItem>
                          <SelectItem value="Feature">Feature Request</SelectItem>
                          <SelectItem value="General">General Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        value={userEmail}
                        required
                        onChange={(e) => setUserEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-base font-semibold">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief summary of your feedback"
                        value={subject}
                        required
                        onChange={(e) => setSubject(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-base font-semibold">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more details..."
                        className="min-h-[150px] resize-y"
                        value={message}
                        required
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </section>

                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-background border-r-transparent animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send size={16} />
                          Send Feedback
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Thank you!</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                Your feedback has been successfully sent. We appreciate your time and input in making our application better.
              </p>
              <Button variant="outline" onClick={() => setIsSuccess(false)}>
                Send another message
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="border-t border-border pt-8 mt-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

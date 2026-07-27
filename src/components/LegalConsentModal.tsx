"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Loader2, ScrollText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LEGAL_VERSION, LEGAL_LAST_UPDATED } from "@/lib/legal";
import TermsContent from "./legal/TermsContent";
import PrivacyContent from "./legal/PrivacyContent";

const storageKey = (userId: string) => `shivora_legal_accepted_${userId}`;

/**
 * Shows the Terms & Conditions / Privacy Policy once per account, and again
 * whenever LEGAL_VERSION is bumped. The acceptance is stored per user in the
 * `legal_acceptances` table (with a localStorage fallback if that table has
 * not been created yet, so the modal can never lock anyone out).
 */
export default function LegalConsentModal() {
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"terms" | "privacy">("terms");
  const [saving, setSaving] = useState(false);
  const [declined, setDeclined] = useState(false);

  const checkAcceptance = useCallback(async (id: string) => {
    const supabase = createClient();
    let accepted = false;

    const { data, error } = await supabase
      .from("legal_acceptances")
      .select("version")
      .eq("user_id", id)
      .maybeSingle();

    if (error) {
      // Table missing or unreadable — fall back to the local record.
      accepted = localStorage.getItem(storageKey(id)) === LEGAL_VERSION;
    } else {
      accepted = data?.version === LEGAL_VERSION;
    }

    if (!accepted) {
      setTab("terms");
      setDeclined(false);
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        checkAcceptance(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") {
          setUserId(session.user.id);
          checkAcceptance(session.user.id);
        }
      } else {
        setUserId(null);
        setOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAcceptance]);

  // Lock body scroll while the consent gate is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  const handleAccept = async () => {
    if (!userId || saving) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("legal_acceptances").upsert(
      { user_id: userId, version: LEGAL_VERSION, accepted_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

    if (error) {
      // Keep the acceptance locally so the customer isn't asked on every visit.
      console.error("Could not record terms acceptance:", error.message);
    }
    localStorage.setItem(storageKey(userId), LEGAL_VERSION);

    setSaving(false);
    setOpen(false);
  };

  const handleDecline = () => setDeclined(true);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    setDeclined(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-obsidian/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-consent-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-obsidian border border-ash/20 text-creme"
          >
            {/* Header */}
            <div className="px-6 md:px-10 pt-8 pb-6 border-b border-ash/10">
              <div className="flex items-center gap-3 mb-3 text-ash">
                <ScrollText size={18} />
                <span className="text-[10px] tracking-[0.3em] uppercase">Updated {LEGAL_LAST_UPDATED}</span>
              </div>
              <h2 id="legal-consent-title" className="font-cinzel text-2xl md:text-3xl mb-3">
                Our Terms &amp; Privacy Policy
              </h2>
              <p className="text-ash text-sm leading-relaxed">
                We&apos;ve updated our Terms &amp; Conditions and Privacy Policy. Please review and accept
                them to continue using your Shivora account.
              </p>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setTab("terms")}
                  className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors duration-200 cursor-pointer ${tab === "terms" ? "border-creme text-creme" : "border-ash/20 text-ash hover:text-creme"}`}
                >
                  Terms &amp; Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setTab("privacy")}
                  className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase border transition-colors duration-200 cursor-pointer ${tab === "privacy" ? "border-creme text-creme" : "border-ash/20 text-ash hover:text-creme"}`}
                >
                  Privacy Policy
                </button>
              </div>
            </div>

            {/* Scrollable policy body */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 text-sm">
              {tab === "terms" ? <TermsContent /> : <PrivacyContent />}
            </div>

            {/* Footer actions */}
            <div className="px-6 md:px-10 py-6 border-t border-ash/10 bg-ash/5">
              {declined ? (
                <div className="space-y-4">
                  <p className="text-sm text-ash leading-relaxed">
                    You need to accept the Terms &amp; Conditions and Privacy Policy to keep using your
                    account. You can keep browsing the store while signed out, or sign back in and
                    accept at any time.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex-1 py-3 border border-ash/30 text-ash text-[11px] tracking-[0.2em] uppercase cursor-pointer hover:text-creme hover:border-creme transition-colors duration-300"
                    >
                      Sign Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeclined(false)}
                      className="flex-1 py-3 bg-creme text-obsidian text-[11px] tracking-[0.2em] uppercase font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-colors duration-300"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleDecline}
                      disabled={saving}
                      className="flex-1 py-3 border border-ash/30 text-ash text-[11px] tracking-[0.2em] uppercase cursor-pointer hover:text-creme hover:border-creme transition-colors duration-300 disabled:opacity-50"
                    >
                      Do Not Accept
                    </button>
                    <button
                      type="button"
                      onClick={handleAccept}
                      disabled={saving}
                      className="flex-1 py-3 bg-creme text-obsidian text-[11px] tracking-[0.2em] uppercase font-semibold cursor-pointer hover:bg-primary hover:text-creme transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {saving ? (<><Loader2 size={14} className="animate-spin" /> Saving…</>) : "I Accept"}
                    </button>
                  </div>
                  <p className="mt-4 text-[11px] text-ash/70 text-center">
                    You can read these any time at{" "}
                    <Link href="/terms-of-service" className="underline hover:text-creme">Terms &amp; Conditions</Link>
                    {" "}and{" "}
                    <Link href="/privacy-policy" className="underline hover:text-creme">Privacy Policy</Link>.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

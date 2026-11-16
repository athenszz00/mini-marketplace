"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { demoListings, formatPrice, getSupabase, type Listing } from "@/lib/marketplace";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadListing() {
      const client = getSupabase();
      if (client) {
        const { data, error } = await client
          .from("listings")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();
        if (active) {
          setListing(error ? null : data);
          setLoadError(error ? "We couldn't load this listing. Please try again." : "");
          setLoading(false);
        }
      } else {
        if (active) {
          setListing(demoListings.find((item) => item.id === params.id) ?? null);
          setLoading(false);
        }
      }
    }
    void loadListing();
    return () => { active = false; };
  }, [params.id]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessageError("");
    if (!listing) return;
    const client = getSupabase();
    if (!client) {
      setMessageError("Messaging will be available once Supabase is connected.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    setSending(true);
    const { error } = await client.from("messages").insert({
      listing_id: listing.id,
      buyer_name: String(formData.get("name")).trim(),
      buyer_email: String(formData.get("email")).trim(),
      message: String(formData.get("message")).trim(),
    });
    if (error) {
      setMessageError(error.message);
    } else {
      setMessageSent(true);
    }
    setSending(false);
  }

  return (
    <main className="detail-page">
      <header className="form-header detail-header">
        <Link className="brand" href="/">
          <span className="brand-mark">l<span>f</span></span>
          <span className="brand-name">little finds<span className="brand-dot">.</span></span>
        </Link>
        <Link className="back-link" href="/">← All the good finds</Link>
      </header>
      {loading ? (
        <div className="detail-loading">A moment, finding it…</div>
      ) : loadError ? (
        <div className="empty-state detail-not-found" role="alert"><span>✳</span><h2>We lost this little find.</h2><p>{loadError}</p><Link className="button button-dark button-small" href="/">Back to browsing</Link></div>
      ) : !listing ? (
        <div className="empty-state detail-not-found"><span>✳</span><h2>That find has wandered off.</h2><p>It may have found a new home already.</p><Link className="button button-dark button-small" href="/">Back to browsing</Link></div>
      ) : (
        <div className="detail-layout">
          <div className="detail-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="detail-image" src={listing.image_url} alt={listing.title} />
            <span className="detail-image-note">A LITTLE FIND, READY FOR YOU ✳</span>
          </div>
          <div className="detail-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> {listing.category.toUpperCase()}</span>
            <h1>{listing.title}</h1>
            <p className="detail-price">{formatPrice(listing.price)}</p>
            <p className="detail-description">{listing.description}</p>
            <div className="seller-card">
              <span className="seller-avatar">{listing.seller_email[0].toUpperCase()}</span>
              <div><small>SHARED BY A NEIGHBOR</small><a href={`mailto:${listing.seller_email}`}>{listing.seller_email}</a></div>
            </div>
            <div className="message-panel">
              <h2>Could this be your new thing?</h2>
              {messageSent ? (
                <div className="message-success" role="status"><span>✳</span><div><strong>Your note is on its way.</strong><p>The seller can get back to you at your email.</p></div></div>
              ) : (
                <form className="message-form" onSubmit={sendMessage}>
                  <label className="field"><span>Your name <i>*</i></span><input name="name" required maxLength={80} placeholder="What should we call you?" /></label>
                  <label className="field"><span>Your email <i>*</i></span><input name="email" type="email" required maxLength={254} placeholder="you@example.com" /></label>
                  <label className="field"><span>Your note <i>*</i></span><textarea name="message" rows={3} required minLength={2} maxLength={2000} placeholder="Hi! Is this still looking for a home?" /></label>
                  {messageError && <p className="form-error" role="alert">{messageError}</p>}
                  <button className="button button-dark submit-button" type="submit" disabled={sending}>{sending ? "Sending your note…" : "Message the seller"} <span>↗</span></button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      <footer className="detail-footer"><span>GOOD THINGS FIND GOOD HOMES.</span><Link href="/">← Back to little finds</Link></footer>
    </main>
  );
}

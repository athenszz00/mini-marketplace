"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { categories, getSupabase, type Category } from "@/lib/marketplace";

export default function SellPage() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Images need to be smaller than 8 MB.");
      return;
    }
    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const supabase = getSupabase();
    if (!supabase) {
      setError("Connect your Supabase project first. Add its URL and anon key to .env.local.");
      return;
    }
    if (!image) {
      setError("Add a photo so people can see your lovely find.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const category = String(formData.get("category")) as Exclude<Category, "All">;
    setSubmitting(true);

    try {
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const imagePath = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("marketplace-photos")
        .upload(imagePath, image, { contentType: image.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: imageData } = supabase.storage
        .from("marketplace-photos")
        .getPublicUrl(imagePath);
      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          title: String(formData.get("title")).trim(),
          description: String(formData.get("description")).trim(),
          price: Number(formData.get("price")),
          seller_email: String(formData.get("email")).trim(),
          category,
          image_url: imageData.publicUrl,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      router.push(`/listings/${data.id}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong while saving your listing.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="form-page">
      <header className="form-header">
        <Link className="brand" href="/">
          <span className="brand-mark">l<span>f</span></span>
          <span className="brand-name">little finds<span className="brand-dot">.</span></span>
        </Link>
        <Link className="back-link" href="/">← Back to the good finds</Link>
      </header>
      <div className="form-layout">
        <div className="form-intro">
          <span className="eyebrow"><span className="eyebrow-dot" /> GIVE IT A NEW HOME</span>
          <h1>Someone’s looking<br />for <span>your something.</span></h1>
          <p>Tell us a little about your find. The right person is just around the corner.</p>
          <div className="form-aside-note"><span>✳</span><p>Good photos help good things find good people. Add a bright, clear shot.</p></div>
        </div>
        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="form-section-label"><span>01</span> THE GOOD THING</div>
          <label className={`upload-box${preview ? " has-image" : ""}`} htmlFor="photo">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview of your listing" />
            ) : (
              <span className="upload-prompt"><span className="upload-icon">↑</span><strong>Drop a photo here, or browse</strong><small>JPG, PNG or WebP · up to 8 MB</small></span>
            )}
            <input
              ref={fileInput}
              id="photo"
              type="file"
              accept="image/*"
              onChange={(event) => chooseImage(event.target.files?.[0])}
            />
            {preview && <span className="change-photo">Change photo</span>}
          </label>

          <label className="field">
            <span>What are you passing along? <i>*</i></span>
            <input name="title" placeholder="e.g. The comfiest little armchair" required maxLength={100} />
          </label>
          <label className="field">
            <span>Tell us its story <i>*</i></span>
            <textarea name="description" placeholder="How was it loved? What should its next person know?" rows={4} required maxLength={2000} />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Asking price <i>*</i></span>
              <div className="price-input"><span>$</span><input name="price" type="number" placeholder="0" min="0.01" max="1000000" step="0.01" required /></div>
            </label>
            <label className="field">
              <span>It belongs in <i>*</i></span>
              <select name="category" required defaultValue="" aria-label="Category">
                <option value="" disabled>Pick a category</option>
                {categories.slice(1).map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
          </div>
          <div className="form-section-label contact-label"><span>02</span> A WAY TO SAY HELLO</div>
          <label className="field">
            <span>Your email address <i>*</i></span>
            <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required maxLength={254} />
            <small className="field-help">Buyers will use this to get in touch about your listing.</small>
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark submit-button" type="submit" disabled={submitting}>
            {submitting ? "Finding it a new home…" : "Post your listing"} <span>↗</span>
          </button>
          <p className="form-footnote">By posting, you agree to be a good neighbor. Listings are public.</p>
        </form>
      </div>
    </main>
  );
}

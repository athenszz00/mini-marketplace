"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categories,
  demoListings,
  formatPrice,
  getSupabase,
  type Category,
  type Listing,
} from "@/lib/marketplace";

function Logo() {
  return (
    <Link className="brand" href="/" aria-label="little finds home">
      <span className="brand-mark">l<span>f</span></span>
      <span className="brand-name">little finds<span className="brand-dot">.</span></span>
    </Link>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#discover">Explore</a>
          <Link className="button button-dark button-small" href="/sell">
            <span className="plus">+</span> Sell something
          </Link>
        </nav>
      </div>
    </header>
  );
}

function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className={`listing-card card-delay-${index % 4}`}
    >
      <div className="card-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="card-image" src={listing.image_url} alt={listing.title} />
        <span className="card-category">{listing.category}</span>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="card-copy">
        <h3>{listing.title}</h3>
        <div className="card-meta">
          <span>{formatPrice(listing.price)}</span>
          <span className="card-location">a little find nearby</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const client = getSupabase();
    if (!client) return;
    setIsConfigured(true);

    client
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setListings([]);
          setLoadError("We couldn't load listings just now. Please try again.");
          return;
        }
        setListings(data ?? []);
      });
  }, []);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const inCategory =
        activeCategory === "All" || listing.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        `${listing.title} ${listing.description} ${listing.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      return inCategory && matchesQuery;
    });
  }, [activeCategory, listings, query]);

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> THE NEIGHBORHOOD MARKETPLACE</span>
              <h1>Good things<br />find <span>good homes.</span></h1>
              <p>A little place for the things you love, and the people who will love them next.</p>
              <div className="hero-actions">
                <a className="button button-dark" href="#discover">Find your next thing <span aria-hidden="true">↘</span></a>
                <Link className="hero-secondary" href="/sell">Have something to share? <span>Sell it here →</span></Link>
              </div>
              <div className="hero-note">
                <span className="avatar-stack" aria-hidden="true"><i>J</i><i>M</i><i>A</i></span>
                <span>Good finds. <strong>Good neighbors.</strong></span>
              </div>
            </div>
            <div className="hero-art" aria-label="A cozy chair and home decor">
              <div className="hero-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1100&q=90" alt="Sunlit living room with thoughtful, secondhand finds" />
              </div>
              <div className="hero-sticker"><span>♡</span><br />pass it<br />along</div>
              <div className="hero-caption"><span className="caption-dot" /> A little more loved, a little less wasted.</div>
              <span className="hero-sparkle sparkle-one">✳</span>
              <span className="hero-sparkle sparkle-two">✳</span>
            </div>
            <div className="hero-index">01 <span>—</span> COMMUNITY FINDS</div>
          </div>
          <div className="hero-bottom">
            <span>THINGS WITH A LITTLE MORE STORY</span>
            <span>↓&nbsp; SCROLL A LITTLE</span>
          </div>
        </section>

        <section className="discover section-shell" id="discover">
          <div className="section-heading">
            <div>
              <span className="eyebrow section-eyebrow">A GOOD PLACE TO START</span>
              <h2>Find your <span>kind of thing.</span></h2>
            </div>
            <p>Pre-loved, well-loved, ready to be loved again.</p>
          </div>

          <div className="browse-tools">
            <div className="category-list" role="tablist" aria-label="Filter by category">
              {categories.map((category) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={`category-tab${activeCategory === category ? " active" : ""}`}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Looking for something?"
                aria-label="Search listings"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>↵</kbd>
            </label>
          </div>

          {!isConfigured && (
            <div className="setup-notice">
              <span>✳</span>
              <p><strong>Preview mode.</strong> Connect Supabase to publish and browse real neighborhood finds.</p>
              <Link href="/sell">Get started →</Link>
            </div>
          )}
          {loadError && <p className="inline-error" role="alert">{loadError}</p>}

          {filteredListings.length ? (
            <div className="listing-grid">
              {filteredListings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>✳</span>
              <h3>No finds just yet.</h3>
              <p>Try another search, or be the first to share something lovely.</p>
              <Link className="button button-dark button-small" href="/sell">List an item →</Link>
            </div>
          )}
          <div className="browse-footer"><span>EVERY FIND HAS A STORY</span><span>{filteredListings.length} lovely {filteredListings.length === 1 ? "thing" : "things"}</span></div>
        </section>

        <section className="share-banner">
          <span className="banner-sparkle">✳</span>
          <div>
            <span className="eyebrow">PASS IT ON</span>
            <h2>Your good thing<br />could be <em>someone’s</em> good thing.</h2>
          </div>
          <Link className="button button-light" href="/sell">Share something lovely <span>↗</span></Link>
          <span className="banner-doodle" aria-hidden="true">⌁</span>
        </section>
      </main>
      <footer className="site-footer">
        <Logo />
        <span>Made for the things that deserve another home.</span>
        <span>© 2026 LITTLE FINDS</span>
      </footer>
    </>
  );
}

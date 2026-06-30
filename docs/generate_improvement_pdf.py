"""Generate Rhentify improvement guide PDF from structured content."""
from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).parent / "rhentify-improvement-guide.pdf"


def ascii_safe(text: str) -> str:
    return (
        text.replace("\u2014", "-")
        .replace("\u2013", "-")
        .replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u2022", "-")
        .replace("\u2192", "->")
    )


class GuidePDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "Rhentify - Site Review & Growth Guide", align="R", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def section_title(self, text: str):
        self.ln(4)
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(30, 41, 59)
        self.multi_cell(self.epw, 8, ascii_safe(text))
        self.ln(2)

    def sub_title(self, text: str):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(51, 65, 85)
        self.multi_cell(self.epw, 7, ascii_safe(text))
        self.ln(1)

    def body(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, ascii_safe(text))
        self.ln(1)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, ascii_safe(f"  -  {text}"))


def build():
    pdf = GuidePDF()
    pdf.set_margins(18, 18, 18)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(15, 23, 42)
    pdf.multi_cell(pdf.epw, 10, "Rhentify")
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(217, 119, 6)
    pdf.multi_cell(pdf.epw, 9, "Site Review & Growth Guide")
    pdf.ln(3)
    pdf.body("Website: https://rhentify.com")
    pdf.body("Prepared: June 2026")
    pdf.body("Purpose: Actionable improvements to fix trust issues, improve UX, and grow early users.")

    pdf.section_title("Executive summary")
    pdf.body(
        "Rhentify has a polished landing page and a solid product foundation — local rentals plus hiring, "
        "zero platform fees, and clear messaging. The main blocker is not design; it is marketplace liquidity. "
        "At review time there were only a handful of listings in Budapest, mostly from one owner, and the "
        "rent-requests feed was empty."
    )
    pdf.body(
        "Win one neighborhood first: supply, then local demand, then first happy transactions, "
        "then word of mouth, then expand cities."
    )

    pdf.section_title("Part 1 - Critical issues (fix first)")
    issues = [
        ("Homepage shows no listings", "Search had listings but homepage said empty", "Visitors think site is dead"),
        ("Dashboard stuck loading", "Spinner for logged-out users", "Dead-end instead of login redirect"),
        ("Broken forgot password", "Link existed, page did not", "Broken trust flow"),
        ("Placeholder contact info", "Fake email, phone, address", "Looks unfinished"),
        ("Empty resources page", "Cards with no content", "Hurts owner onboarding"),
        ("Generic social links", "facebook.com, twitter.com", "No real brand presence"),
        ("Reviews inconsistency", "Ratings on cards vs detail page", "Undermines trust"),
    ]
    for issue, observed, why in issues:
        pdf.sub_title(issue)
        pdf.body(f"Observed: {observed}")
        pdf.body(f"Why it matters: {why}")

    pdf.section_title("Part 2 - UX & product improvements")
    sections = {
        "Mobile experience": [
            "Show listings first; collapse filters behind a Filters button on mobile.",
            "Improve form label contrast for accessibility.",
        ],
        "Geographic & currency clarity": [
            "Use launch messaging: Now live in Budapest - expanding soon.",
            "Add city picker or location context on homepage.",
            "Show HUF / Ft consistently instead of only dollar framing.",
        ],
        "Onboarding after signup": [
            "Post-signup wizard: I want to rent vs I want to earn.",
            "One clear next action on the dashboard.",
        ],
        "Listing quality": [
            "Guide owners: photos, correct category, clear pricing, pickup details.",
            "Optional publish checklist before going live.",
        ],
        "Trust page accuracy": [
            "Only claim verification and support that is actually live.",
            "Honest trust beats overpromising.",
        ],
        "Register & SEO": [
            "Replace Join thousands with Be an early member in Budapest.",
            "Per-page metadata, Open Graph, city landing pages for local SEO.",
        ],
    }
    for title, bullets in sections.items():
        pdf.sub_title(title)
        for b in bullets:
            pdf.bullet(b)

    pdf.section_title("Part 3 - What is already working well")
    for item in [
        "Strong homepage hero with search and owner CTA",
        "Rent requests feed - demand before supply",
        "Listing detail: pricing, deposit, dates, Request to Book",
        "Broad categories and Google sign-in",
        "Dark mode and modern design",
        "In-app messaging and booking structure",
    ]:
        pdf.bullet(item)

    pdf.section_title("Part 4 - How to get people using Rhentify")
    pdf.sub_title("Phase 1: Supply (weeks 1-4) - 30-50 listings")
    for b in [
        "Hyperfocus on Budapest in every message and listing.",
        "Recruit anchor owners: photographers, DJs, tool owners, students, freelancers.",
        "Founding-owner perks: featured placement, zero fees, help with photos/copy.",
        "Seed with 5-10 partners - one owner with 4 items is not enough variety.",
    ]:
        pdf.bullet(b)

    pdf.sub_title("Phase 2: Demand (weeks 2-6)")
    for b in [
        "Push rent requests: Need something? Post a request - owners reply in 24h.",
        "Facebook groups, universities, expat communities, buy-nothing groups.",
        "Use-case ads: camera weekend rental, civil engineer, moving vacuum.",
        "Referrals: renter refers owner, owner refers renter.",
    ]:
        pdf.bullet(b)

    pdf.sub_title("Phase 3: Conversion")
    for b in [
        "Browse without signup; login only at Request to Book.",
        "Homepage must show real listings.",
        "Email capture for other cities: notify when we launch near you.",
        "First-booking nudge after signup.",
        "Fill Resources with pricing, photo, and deposit guides.",
    ]:
        pdf.bullet(b)

    pdf.sub_title("Phase 4: Trust")
    for b in [
        "Real support: support@rhentify.com",
        "Verified badges only when KYC is done",
        "Show X listings in Budapest on homepage",
        "Testimonials after first real bookings",
        "Respond fast to every booking request",
    ]:
        pdf.bullet(b)

    pdf.section_title("Part 5 - 30-day action plan")
    plan = [
        ("Week 1", "Fix bugs + trust", "Listings on homepage, dashboard redirect, real contact"),
        ("Week 2", "Supply blitz", "20+ listings from 10+ owners in Budapest"),
        ("Week 3", "Demand", "5 communities; 10+ rent requests on /feed"),
        ("Week 4", "Transactions", "Personally facilitate 3–5 bookings end-to-end"),
    ]
    for week, focus, goal in plan:
        pdf.sub_title(week)
        pdf.body(f"Focus: {focus}")
        pdf.body(f"Goal: {goal}")

    pdf.section_title("Part 6 - Highest-impact quick wins")
    for i, item in enumerate(
        [
            "Fix homepage featured listings",
            "Add Now in Budapest to hero and metadata",
            "Replace placeholder contact / support info",
            "Build forgot-password flow",
            "Add post-signup dashboard onboarding",
            "Personally recruit 10 owners before paid ads",
        ],
        1,
    ):
        pdf.bullet(f"{i}. {item}")

    pdf.section_title("Part 7 - Technical implementation (in codebase)")
    pdf.body("These items were implemented in the repository for deploy:")
    for b in [
        "Hero: Budapest badge, improved copy, Budapest search default",
        "FeaturedListings: loading state, Budapest-first fetch, ListingCard",
        "Dashboard: auth redirect + onboarding component",
        "Auth: forgot-password and reset-password pages + API",
        "Contact, Safety, About, Resources, Footer, Register: honest copy",
        "SearchFilters: collapsed on mobile by default",
        "SEO metadata and production S3 image config",
    ]:
        pdf.bullet(b)

    pdf.sub_title("Deploy checklist")
    for b in [
        "DB: password_reset_token and password_reset_expires_at on users table",
        "Backend: MAIL_* env vars and FRONTEND_URL=https://rhentify.com",
        "Frontend: NEXT_PUBLIC_SUPPORT_EMAIL=support@rhentify.com (optional)",
        "Redeploy frontend and backend together",
    ]:
        pdf.bullet(b)

    pdf.section_title("Bottom line")
    pdf.body(
        "Rhentify does not need a full redesign - it needs density in one city and a few trust fixes. "
        "The product is ahead of the market. Focus on Budapest until you have repeatable bookings, "
        "then clone the playbook in the next city."
    )
    pdf.ln(4)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(pdf.epw, 5, "Document for Rhentify. Revisit quarterly as inventory and users grow.")

    pdf.output(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    build()

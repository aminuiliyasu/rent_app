"""Generate monetization playbook PDF from markdown source."""
from generate_playbook_pdf import ROOT, build_pdf

if __name__ == "__main__":
    build_pdf(
        ROOT / "monetization-playbook.md",
        ROOT / "monetization-playbook.pdf",
    )

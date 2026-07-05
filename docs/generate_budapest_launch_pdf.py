"""Generate Budapest launch playbook PDF from markdown source."""
from generate_playbook_pdf import ROOT, build_pdf

if __name__ == "__main__":
    build_pdf(
        ROOT / "budapest-launch-playbook.md",
        ROOT / "budapest-launch-playbook.pdf",
    )

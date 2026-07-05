"""Generate a playbook PDF from markdown source."""
from __future__ import annotations

import re
import sys
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).parent
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
FONT_ITALIC = Path(r"C:\Windows\Fonts\ariali.ttf")


def strip_md_inline(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    text = text.replace("\u2610", "[ ]")
    return text.strip()


class PlaybookPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.add_font("Arial", "", str(FONT))
        self.add_font("Arial", "B", str(FONT_BOLD))
        self.add_font("Arial", "I", str(FONT_ITALIC))
        self.set_margins(16, 16, 16)
        self.set_auto_page_break(auto=True, margin=16)

    def footer(self):
        self.set_y(-14)
        self.set_font("Arial", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Page {self.page_no()}", align="C")

    def h1(self, text: str):
        self.ln(3)
        self.set_font("Arial", "B", 18)
        self.set_text_color(15, 23, 42)
        self.multi_cell(self.epw, 8, text)
        self.ln(2)

    def h2(self, text: str):
        self.ln(4)
        self.set_font("Arial", "B", 13)
        self.set_text_color(30, 41, 59)
        self.multi_cell(self.epw, 7, text)
        self.ln(1)

    def h3(self, text: str):
        self.ln(2)
        self.set_font("Arial", "B", 11)
        self.set_text_color(51, 65, 85)
        self.multi_cell(self.epw, 6, text)
        self.ln(1)

    def meta(self, text: str):
        self.set_font("Arial", "", 10)
        self.set_text_color(60, 60, 60)
        self.multi_cell(self.epw, 5.5, text)
        self.ln(0.5)

    def body(self, text: str):
        self.set_font("Arial", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, text)
        self.ln(1)

    def quote(self, text: str):
        self.set_font("Arial", "I", 9.5)
        self.set_text_color(55, 55, 55)
        x = self.l_margin + 4
        self.set_x(x)
        self.multi_cell(self.epw - 8, 5.2, text)
        self.ln(1.5)

    def bullet(self, text: str):
        self.set_font("Arial", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(self.epw, 5.5, f"  -  {text}")
        self.ln(0.5)

    def rule(self):
        self.ln(2)
        self.set_draw_color(200, 200, 200)
        y = self.get_y()
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(4)

    def table(self, rows: list[list[str]]):
        if not rows:
            return
        cols = len(rows[0])
        col_w = self.epw / cols
        line_h = 5.5

        for r_idx, row in enumerate(rows):
            row = row + [""] * (cols - len(row))
            if r_idx == 0:
                self.set_font("Arial", "B", 8.5)
                self.set_fill_color(241, 245, 249)
            elif r_idx == 1 and all(set(c) <= {"-", ":", " "} for c in row):
                continue
            else:
                self.set_font("Arial", "", 8.5)
                self.set_fill_color(255, 255, 255)

            self.set_text_color(30, 30, 30)
            x0 = self.l_margin
            y0 = self.get_y()
            heights = []
            for cell in row:
                heights.append(
                    self.get_string_width(cell) / (col_w - 2) * line_h + line_h
                    if cell
                    else line_h
                )
            row_h = max(heights) + 2

            if y0 + row_h > self.h - self.b_margin:
                self.add_page()
                y0 = self.get_y()

            x = x0
            for cell in row:
                self.set_xy(x, y0)
                self.multi_cell(col_w, line_h, cell, border=1, fill=r_idx == 0)
                x += col_w
            self.set_y(y0 + row_h)


def parse_table(lines: list[str]) -> list[list[str]]:
    rows = []
    for line in lines:
        if not line.strip().startswith("|"):
            break
        cells = [strip_md_inline(c.strip()) for c in line.strip().strip("|").split("|")]
        rows.append(cells)
    return rows


def build_pdf(md_path: Path, out_path: Path) -> None:
    text = md_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    pdf = PlaybookPDF()
    pdf.add_page()

    i = 0
    quote_buf: list[str] = []
    table_buf: list[str] = []

    def flush_quote():
        nonlocal quote_buf
        if quote_buf:
            pdf.quote("\n".join(quote_buf))
            quote_buf = []

    def flush_table():
        nonlocal table_buf
        if table_buf:
            pdf.ln(1)
            pdf.table(parse_table(table_buf))
            pdf.ln(2)
            table_buf = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("|"):
            flush_quote()
            table_buf.append(stripped)
            i += 1
            continue
        flush_table()

        if stripped.startswith(">"):
            quote_buf.append(strip_md_inline(stripped.lstrip("> ").strip()))
            i += 1
            continue
        flush_quote()

        if stripped == "---":
            pdf.rule()
            i += 1
            continue

        if stripped.startswith("# "):
            pdf.h1(strip_md_inline(stripped[2:]))
            i += 1
            continue

        if stripped.startswith("## "):
            pdf.h2(strip_md_inline(stripped[3:]))
            i += 1
            continue

        if stripped.startswith("### "):
            pdf.h3(strip_md_inline(stripped[4:]))
            i += 1
            continue

        if stripped.startswith("- "):
            pdf.bullet(strip_md_inline(stripped[2:]))
            i += 1
            continue

        m = re.match(r"^(\d+)\.\s+(.+)$", stripped)
        if m:
            pdf.bullet(f"{m.group(1)}. {strip_md_inline(m.group(2))}")
            i += 1
            continue

        if stripped.startswith("**") and stripped.endswith("**") and stripped.count("**") == 2:
            pdf.h3(strip_md_inline(stripped))
            i += 1
            continue

        if stripped.startswith("**") and "**" in stripped[2:]:
            pdf.meta(strip_md_inline(stripped))
            i += 1
            continue

        if stripped.startswith("*") and stripped.endswith("*") and not stripped.startswith("**"):
            pdf.set_font("Arial", "I", 9)
            pdf.set_text_color(100, 100, 100)
            pdf.multi_cell(pdf.epw, 5, strip_md_inline(stripped.strip("*")))
            pdf.ln(1)
            i += 1
            continue

        if stripped:
            pdf.body(strip_md_inline(stripped))
        i += 1

    flush_quote()
    flush_table()
    pdf.output(out_path)
    print(f"Wrote {out_path}")


def main() -> None:
    if len(sys.argv) >= 2:
        md = Path(sys.argv[1])
        out = Path(sys.argv[2]) if len(sys.argv) >= 3 else md.with_suffix(".pdf")
    else:
        md = ROOT / "budapest-launch-playbook.md"
        out = ROOT / "budapest-launch-playbook.pdf"
    build_pdf(md, out)


if __name__ == "__main__":
    main()

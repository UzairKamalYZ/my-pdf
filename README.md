# Fill & Sign

A single-file, browser-only tool for filling in and signing PDFs. Open a PDF, click anywhere to type, draw your signature, and download the finished file. Nothing is uploaded: the whole thing runs in your browser.

## Features

- **Open any PDF** with the Open button, the file picker, or drag and drop. Multi-page documents work.
- **Add text** anywhere on a page. You can pick the size (9–24 pt) and the ink colour (black or blue). Text boxes support multiple lines and can be moved with the grip handle.
- **Create a signature** by drawing it on a pad, or by typing your name and picking one of three handwriting fonts (Dancing Script, Great Vibes, Caveat). It is cropped to the strokes, placed with a click, and can be moved and resized. Your last signature is saved in `localStorage` so you can reuse it.
- **Download** a new PDF named `<original>-signed.pdf`. Text and signatures are written into the real PDF, not just shown on screen.
- **Try a sample page**: makes a sample "Equipment loan form" so you can try the editor without a file.
- Light and dark themes follow your system setting, and the layout works on phones.

## Usage

There is no build step. Open `index.html` in a modern browser:

```sh
open index.html            # macOS
# or serve it locally
python3 -m http.server 8000  # then visit http://localhost:8000
```

An internet connection is needed the first time, because the libraries and font load from CDNs.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `T` | Text tool |
| `S` | Open the signature pad |
| `Delete` / `Backspace` | Delete the selected item |
| `Esc` | Go back to the Select tool and clear the selection |

## How it works

| Concern | Implementation |
| --- | --- |
| Rendering | [PDF.js](https://mozilla.github.io/pdf.js/) 3.11.174 draws each page to a `<canvas>`, with a positioned overlay layer on top for items. |
| Coordinates | Item positions are kept in PDF points (top-left origin) and shown as percentages, so they stay correct at any zoom or screen size. Text size uses container query units (`cqw`). |
| Export | [pdf-lib](https://pdf-lib.js.org/) 1.17.1 loads the original bytes and draws text in Helvetica and signatures as embedded PNGs. Positions are adjusted for each page's crop box. |

## Limitations

- Exported text uses the standard Helvetica font, which only covers Latin-1 characters plus a few typographic symbols. Any other character becomes `?`.
- PDFs protected with a password to open them cannot be loaded.
- Existing AcroForm fields are not detected. Text is drawn over the page.
- Edits only exist in the page until you download. Reloading the page loses them.

## Project structure

```
index.html   # the whole app: markup, styles and script
```

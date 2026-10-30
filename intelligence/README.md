# IAM Intelligence reader

Route: `/intelligence/`. Issue 01, From Intelligence to Agency, is the first
source-linked periodical edition. Editorial direction and the seven departments
are recorded in EDITORIAL.md. Publication is manual, at the editor's prompt.

## Narration

Sky is Kokoro `af_sky`, American English. Audio is generated once at publication
time, served as a static MP3, and synchronized with `HTMLAudioElement.currentTime`.
No browser speech synthesis, Gemini quota, API key, or visitor model download is
required. Model-derived timestamps are approximate speech alignments and still
need listening QA; they are not a claim of independently measured word accuracy.

From the repository root, with Python 3.12 and ffmpeg installed:

```sh
python -m pip install -r scripts/requirements-tts.txt
python scripts/generate-narration.py --edition issue-01
```

For a CPU-only Linux environment, install the CPU build of torch 2.6.0 from
PyTorch's official CPU wheel index before installing the requirements. Kokoro's
first run downloads model weights, Sky's voice pack and the English language
model. Visitors only download the MP3 and timing manifest.

The generator extracts the article's headings and readable paragraphs. It maps
Kokoro's token timestamps onto the displayed words and rejects missing or
nonmonotonic alignments. The player rejects mismatched text/timings rather than
silently narrating a stale recording. Regenerate and commit both `audio/issue-01.mp3`
and `audio/issue-01.json` after editing narration content. Use edition-specific
audio filenames and update the manifest path in reader.js for a new issue.
The first demonstration's `audio/sky.*` files are retained as historical assets.

Controls include pause/resume, restart, seeking, playback speed, and optional
automatic scrolling. Reduced-motion preferences are respected. Browser/iPhone
audio quality and alignment should be reviewed before merging.

Model and library: [hexgrad/Kokoro](https://github.com/hexgrad/kokoro),
[Kokoro-82M model card and license](https://huggingface.co/hexgrad/Kokoro-82M).

## Publishing

Check the issue's linked original sources and record claims, dates, uncertainties
and calculations in its source ledger. Keep reported facts, illustrations and
editorial interpretation distinct. Compute reading time from narrated word count
at 200 words per minute, rounded up; compute listening time from the recording.
When revising narrated content, regenerate audio and timings together and update
the duration metadata. Use a dated correction notice when correcting published
claims. There is no automatic publishing schedule.

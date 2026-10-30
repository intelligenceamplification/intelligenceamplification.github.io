# I.A.M. Intelligence reader

Development route: `/intelligence/`. The sample is editorial demonstration text,
not a dated news edition. Work stays on `feature/iam-intelligence-reader` until
reviewed. The main site navigation already links to this route on that branch.

## Narration

Sky is Kokoro `af_sky`, American English. Audio is generated once at publication
time, served as a static MP3, and synchronized with `HTMLAudioElement.currentTime`.
No browser speech synthesis, Gemini quota, API key, or visitor model download is
required. Model-derived timestamps are approximate speech alignments and still
need listening QA; they are not a claim of independently measured word accuracy.

From the repository root, with Python 3.12 and ffmpeg installed:

```sh
python -m pip install -r scripts/requirements-tts.txt
python scripts/generate-narration.py
```

For a CPU-only Linux environment, install the CPU build of torch 2.6.0 from
PyTorch's official CPU wheel index before installing the requirements. Kokoro's
first run downloads model weights, Sky's voice pack and the English language
model. Visitors only download the MP3 and timing manifest.

The generator extracts the article's headings and readable paragraphs. It maps
Kokoro's token timestamps onto the displayed words and rejects missing or
nonmonotonic alignments. The player rejects mismatched text/timings rather than
silently narrating a stale recording. Regenerate and commit both `audio/sky.mp3`
and `audio/sky.json` after editing narration content.

Controls include pause/resume, restart, seeking, playback speed, and optional
automatic scrolling. Reduced-motion preferences are respected. Browser/iPhone
audio quality and alignment should be reviewed before merging.

Model and library: [hexgrad/Kokoro](https://github.com/hexgrad/kokoro),
[Kokoro-82M model card and license](https://huggingface.co/hexgrad/Kokoro-82M).

## Still to build

The daily public editorial publishing pipeline, source verification, dated
edition archives, and automatic audio generation are separate from this reader
milestone. Do not label the demonstration as today's verified briefing or assume
ChatGPT scheduled messages are available through an API.

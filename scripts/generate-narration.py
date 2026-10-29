"""Generate cached Sky narration and model-derived word timings from the reader.

Run: python scripts/generate-narration.py (requires ffmpeg and requirements-tts.txt).
Never estimates timings from word length or uses a browser voice.
"""
import hashlib
import json
import re
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.inside = False
        self.current = None
        self.blocks = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'article' and attrs.get('id') == 'article':
            self.inside = True
        if self.inside and (tag == 'h2' or 'readable' in attrs.get('class', '').split()):
            self.current = []

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if self.current is not None and tag in ('h2', 'p'):
            self.blocks.append(''.join(self.current))
            self.current = None
        if tag == 'article':
            self.inside = False


def generate():
    import numpy as np
    import soundfile as sf
    import torch
    from kokoro import KPipeline

    torch.set_num_threads(4)
    parser = ArticleParser()
    parser.feed((ROOT / 'intelligence/index.html').read_text())
    blocks = parser.blocks
    assert blocks, 'No narration content found'
    pipeline = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M', device='cpu')
    audio_parts, words = [], []
    samples = 0
    for block_index, text in enumerate(blocks):
        matches = list(re.finditer(r'\S+', text))
        aligned = [None] * len(matches)
        cursor = 0
        for result in pipeline(text, voice='af_sky', speed=1):
            audio = result.audio.detach().cpu().numpy()
            assert result.tokens, 'Kokoro returned no alignment tokens'
            offset = samples / 24000
            for token in result.tokens:
                if not token.text:
                    continue
                start = text.find(token.text, cursor)
                assert start >= cursor, f'Unmatched token: {token.text!r}'
                end = start + len(token.text)
                cursor = end
                if token.start_ts is None or token.end_ts is None:
                    continue
                a, b = offset + float(token.start_ts), offset + float(token.end_ts)
                for i, match in enumerate(matches):
                    if match.start() < end and match.end() > start:
                        aligned[i] = (min(aligned[i][0], a), max(aligned[i][1], b)) if aligned[i] else (a, b)
            audio_parts.append(audio)
            samples += len(audio)
        for match, timing in zip(matches, aligned):
            assert timing is not None, f'Missing word timing: {match.group()}'
            words.append({'block': block_index, 'text': match.group(), 'start': round(timing[0], 4), 'end': round(timing[1], 4)})
        silence = np.zeros(6000, dtype=np.float32)
        audio_parts.append(silence)
        samples += len(silence)
        print(f'Sky: block {block_index + 1}/{len(blocks)} complete', flush=True)
    duration = samples / 24000
    assert all(0 <= w['start'] <= w['end'] <= duration for w in words)
    assert all(a['start'] <= b['start'] for a, b in zip(words, words[1:]))
    out = ROOT / 'intelligence/audio'
    out.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'sky.wav'
        sf.write(wav, np.concatenate(audio_parts), 24000)
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav), '-codec:a', 'libmp3lame', '-b:a', '96k', str(out / 'sky.mp3')], check=True)
    manifest = {'voice': 'af_sky', 'audio': 'audio/sky.mp3', 'duration': duration, 'alignment': 'kokoro-model-durations', 'textSha256': hashlib.sha256('\n'.join(blocks).encode()).hexdigest(), 'blocks': blocks, 'words': words}
    (out / 'sky.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Generated {duration:.1f}s; {len(words)} aligned words')


if __name__ == '__main__':
    generate()

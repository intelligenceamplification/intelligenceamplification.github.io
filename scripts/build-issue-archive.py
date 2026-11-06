"""Build the current IAM reader and chronological archive from released editions.

Publish manually after editorial approval. Drafts never displace a released issue.
"""
from pathlib import Path
from datetime import date
import html,json,re

ROOT=Path(__file__).resolve().parents[1]
BASE='https://intelligenceamplification-github-io.vercel.app'
folder=ROOT/'intelligence'
registry=json.loads((folder/'editions.json').read_text())
editions=sorted((e for e in registry['editions'] if e['status']=='published'),key=lambda e:(e['date'],int(e['issue'])),reverse=True)
assert editions,'At least one published edition is required'
assert len({e['issue'] for e in editions})==len(editions),'Duplicate issue number'
assert all(e['month']==e['date'][:7] for e in editions),'Archive month must match the publication date'
assert len({e['month'] for e in editions})==len(editions),'Publish at most one issue per calendar month'
esc=lambda value:html.escape(str(value),quote=True)
def display_date(value):
    d=date.fromisoformat(value)
    return f'{d.day} {d.strftime("%B %Y")}'
def reading(e):
    seconds=round(e['listeningSeconds']);m,s=divmod(seconds,60)
    return f'{e["readingMinutes"]} min read · {m}:{s:02d} listen' if seconds else f'{e["readingMinutes"]} min read'

current=editions[0]
current_date=date.fromisoformat(current['date'])
registry['nextIssueMonth']=f'{current_date.year+(current_date.month==12):04d}-{current_date.month%12+1:02d}'
for e in editions:
    path=folder/'issues'/e['issue']/'index.html'
    doc=path.read_text()
    manifest=folder/e['manifest']
    assert manifest.is_file(),f'Published Issue {e["issue"]} requires its narration manifest'
    if manifest.exists():
        data=json.loads(manifest.read_text());e['listeningSeconds']=data['duration']
        assert (folder/data['audio']).is_file(),f'Published Issue {e["issue"]} requires its recording'
        m,s=divmod(round(data['duration']),60)
        doc=re.sub(r'(<dd id="listening-estimate">).*?(</dd>)',lambda match:match[1]+f'{m} minutes {s} seconds'+match[2],doc)
    left='<span>Current issue</span>' if e==current else '<a href="/intelligence/">← Current issue</a>'
    nav='<!-- PERIODICAL_NAV_START --><nav class="periodical-navigation" aria-label="Periodical navigation">'+left+'<a href="/intelligence/archive/">Previous issues <span aria-hidden="true">&nbsp;↗</span></a></nav><!-- PERIODICAL_NAV_END -->'
    if '<!-- PERIODICAL_NAV -->' in doc:doc=doc.replace('<!-- PERIODICAL_NAV -->',nav)
    else:doc=re.sub(r'<!-- PERIODICAL_NAV_START -->.*?<!-- PERIODICAL_NAV_END -->',lambda _:nav,doc,flags=re.S)
    path.write_text(doc)
    if e==current:(folder/'index.html').write_text(doc)

template=(folder/'issues'/current['issue']/'index.html').read_text()
header=re.search(r'<header\b.*?</header>',template,re.S).group()
footer=re.search(r'<footer\b.*?</footer>',template,re.S).group()
intro='Monthly reporting on amplified intelligence and the conditions for living well.'
url=BASE+'/intelligence/archive/'
image=BASE+'/assets/iam-issue-'+current['issue']+'-social.png'
head=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>All issues · IAM Intelligence</title><meta name="description" content="{intro}"><link rel="canonical" href="{url}"><meta property="og:type" content="website"><meta property="og:title" content="IAM Intelligence · All issues"><meta property="og:description" content="{intro}"><meta property="og:url" content="{url}"><meta property="og:image" content="{image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="IAM Intelligence · A Periodical Brief"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="IAM Intelligence · All issues"><meta name="twitter:description" content="{intro}"><meta name="twitter:image" content="{image}"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/assets/site.css?v=20261020-titles"><link rel="stylesheet" href="/assets/refinements.css?v=20261101"><link rel="stylesheet" href="/assets/humanist-typography.css?v=dark-20261103"><link rel="stylesheet" href="/assets/iam-periodical.css?v=20261106"><script src="/assets/site-navigation.js?v=20261101" defer></script></head><body>'''
feature=f'''<section class="archive-current" aria-labelledby="current-title"><p class="archive-kicker">Current issue · {date.fromisoformat(current['date']).strftime('%B %Y')}</p><p class="archive-meta">Issue {current['issue']} · <time datetime="{current['date']}">{display_date(current['date'])}</time> · {reading(current)}</p><h2 id="current-title"><a href="/intelligence/">{esc(current['title'])}</a></h2><p class="archive-summary">{esc(current['summary'])}</p><a class="archive-action" href="/intelligence/">Read and listen →</a></section>'''
older=editions[1:];rows=[]
years={e['date'][:4] for e in older}
if older:
    rows.append('<h2 class="earlier-title">Earlier issues</h2>')
    for year in sorted(years,reverse=True):
        if len(years)>1:rows.append(f'<h3>{year}</h3>')
        rows.append('<ol class="archive-list">')
        for e in older:
            if not e['date'].startswith(year):continue
            link='/intelligence/issues/'+e['issue']+'/'
            rows.append(f'<li class="archive-row"><span>Issue {e["issue"]}</span><div><h3><a href="{link}">{esc(e["title"])}</a></h3><p class="archive-meta"><time datetime="{e["date"]}">{display_date(e["date"])}</time> · {reading(e)}</p><a class="archive-action" href="{link}">Read and listen →</a></div></li>')
        rows.append('</ol>')
body=header+'<main class="archive-main"><p class="archive-kicker">IAM Intelligence · A Periodical Brief</p><h1>All issues</h1><p class="archive-intro">'+intro+'</p>'+feature+''.join(rows)+'<p class="archive-end">One issue each month. Every edition remains available to read and listen to. Editorial polishing retains its issue number and original publication date.</p></main>'+footer+'</body></html>'
(folder/'archive').mkdir(exist_ok=True)
(folder/'archive/index.html').write_text(head+body)
(folder/'editions.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
print(f'Current: Issue {current["issue"]}; {len(editions)} released editions; monthly archive built.')

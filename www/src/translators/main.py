import json
import time
import threading
from collections import deque
from googletrans import Translator
from concurrent.futures import ThreadPoolExecutor, as_completed

# -----------------------------------------------------------------------------
# Monkey-patch googletrans to silence JSON parse errors and alias the missing
# 'raise_Exception' attribute to the real 'raise_exception' flag.
# -----------------------------------------------------------------------------
def _get_raise_Exception(self):
    return getattr(self, "raise_exception", True)

def _set_raise_Exception(self, val):
    setattr(self, "raise_exception", val)

Translator.raise_Exception = property(_get_raise_Exception, _set_raise_Exception)

# Create one Translator instance up front, point at the Google-hosted endpoint,
# and disable exception-raising on JSON decode failures.
translator = Translator(service_urls=["translate.googleapis.com"])
translator.raise_Exception = False

# List of language codes to produce .json files for
language_codes = [
    "af","sq","am","ar","hy","az","eu","be","bn","bs","bg","ca","ceb","ny",
    "zh-cn","zh-tw","co","hr","cs","da","nl","en","eo","et","tl","fi","fr",
    "fy","gl","ka","de","el","gu","ht","ha","haw","iw","he","hi","hmn","hu",
    "is","ig","id","ga","it","ja","jw","kn","kk","km","ko","ku","ky","lo","la",
    "lv","lt","lb","mk","mg","ms","ml","mt","mi","mr","mn","my","ne","no","or",
    "ps","fa","pl","pt","pa","ro","ru","sm","gd","sr","st","sn","sd","si","sk",
    "sl","so","es","su","sw","sv","tg","ta","te","th","tr","uk","ur","ug","uz",
    "vi","cy","xh","yi","yo","zu",
]

MAX_WORKERS = 150

# Rate limiter: max 5 translation calls per second
class RateLimiter:
    def __init__(self, max_calls: int, period: float = 1.0):
        self.max_calls = max_calls
        self.period = period
        self.lock = threading.Lock()
        self.calls = deque()

    def acquire(self):
        while True:
            with self.lock:
                now = time.monotonic()
                # purge old timestamps
                while self.calls and now - self.calls[0] > self.period:
                    self.calls.popleft()
                if len(self.calls) < self.max_calls:
                    self.calls.append(now)
                    return
                # sleep until the oldest call expires
                sleep_time = self.period - (now - self.calls[0])
            if sleep_time > 0:
                time.sleep(sleep_time)

rate_limiter = RateLimiter(max_calls=5, period=1.0)

# Load the English source file
try:
    with open("en.json", "r", encoding="utf-8") as f:
        en_json = json.load(f)
except FileNotFoundError:
    print("Error: en.json not found.")
    exit(1)
except json.JSONDecodeError:
    print("Error: en.json is not valid JSON.")
    exit(1)

def flatten_for_translation(d: dict, parent_key: str = "", sep: str = "."):
    flat = {}
    info = []

    def _rec(sub: dict, prefix: str):
        for k, v in sub.items():
            nk = f"{prefix}{sep}{k}" if prefix else k
            if isinstance(v, dict):
                _rec(v, nk)
            elif isinstance(v, str):
                flat[nk] = v
                info.append({"key": nk, "value": v})
            else:
                flat[nk] = str(v)

    _rec(d, parent_key)
    return flat, info

def unflatten(d: dict, sep: str = "."):
    out = {}
    for path, val in d.items():
        parts = path.split(sep)
        ref = out
        for p in parts[:-1]:
            ref = ref.setdefault(p, {})
        ref[parts[-1]] = val
    return out

# Prepare for translation
flat_template, original_info = flatten_for_translation(en_json)
texts = [item["value"] for item in original_info]
if not texts:
    print("No strings found to translate.")
    exit(0)

def translate_and_save_language(lang: str) -> str:
    if lang == "en":
        return f"Skipped {lang} (source)."

    print(f"Translating → {lang}")
    translated_texts = []

    # Split into small batches to reduce chance of parse errors
    BATCH_SIZE = 10
    try:
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            rate_limiter.acquire()
            try:
                results = translator.translate(batch, dest=lang)
            except Exception as batch_err:
                # Fallback: translate each individually
                print(f"  Batch error for {lang}: {batch_err}. Falling back to single-item calls.")
                results = []
                for txt in batch:
                    rate_limiter.acquire()
                    try:
                        res = translator.translate(txt, dest=lang)
                        results.append(res)
                    except Exception as e_single:
                        print(f"    Single-item error on '{txt[:20]}…': {e_single}")
                        # use source string as fallback
                        class Dummy: text = txt
                        results.append(Dummy())

            # Normalize to list
            if not isinstance(results, list):
                results = [results]
            # Extract text (or fallback to original on empty)
            for res in results:
                translated_texts.append(res.text or texts[len(translated_texts)])

        # Ensure we got the right count
        if len(translated_texts) != len(texts):
            raise RuntimeError(f"Translated count mismatch: expected {len(texts)}, got {len(translated_texts)}")

        # Build JSON
        new_flat = flat_template.copy()
        for idx, info in enumerate(original_info):
            new_flat[info["key"]] = translated_texts[idx]
        out_json = unflatten(new_flat)

    except Exception as e:
        print(f"  Fallback on {lang}: {e}")
        out_json = en_json

    # Write the file
    try:
        with open(f"{lang}.json", "w", encoding="utf-8") as wf:
            json.dump(out_json, wf, ensure_ascii=False, indent=2)
        return f"✔ {lang}.json"
    except Exception as save_err:
        return f"✖ Error saving {lang}.json: {save_err}"

if __name__ == "__main__":
    start = time.time()
    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_map = {executor.submit(translate_and_save_language, lc): lc for lc in language_codes if lc != "en"}
        for fut in as_completed(future_map):
            msg = fut.result()
            print(msg)
            results.append(msg)
    elapsed = time.time() - start
    print(f"\nAll done in {elapsed:.1f}s.")
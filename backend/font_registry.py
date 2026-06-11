import os
import logging
from dataclasses import dataclass, field

from fontTools.ttLib import TTFont, TTCollection

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'.ttf', '.otf', '.ttc', '.otc'}


@dataclass
class SystemFont:
    id: str
    family: str
    style: str
    weight: int
    filename: str
    cached_path: str
    face_index: int
    source_format: str
    label: str = field(init=False)

    def __post_init__(self):
        self.label = f'{self.family} {self.style}'


class FontRegistry:
    def __init__(self, fonts_dir, cache_dir):
        self.fonts_dir = fonts_dir
        self.cache_dir = cache_dir
        self._fonts = {}

    def scan(self):
        self._fonts.clear()
        os.makedirs(self.cache_dir, exist_ok=True)

        if not os.path.isdir(self.fonts_dir):
            logger.warning('Fonts directory not found: %s', self.fonts_dir)
            return

        for filename in sorted(os.listdir(self.fonts_dir)):
            filepath = os.path.join(self.fonts_dir, filename)
            if not os.path.isfile(filepath):
                continue

            ext = os.path.splitext(filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue

            try:
                if ext in ('.ttc', '.otc'):
                    self._process_collection(filepath, filename, ext)
                else:
                    self._process_single(filepath, filename, ext, 0)
            except Exception:
                logger.warning('Failed to process font %s', filename, exc_info=True)

        logger.info('Registered %d font faces from %s', len(self._fonts), self.fonts_dir)

    def _process_single(self, filepath, filename, ext, face_index):
        font = TTFont(filepath, fontNumber=face_index)
        try:
            font_id = _make_id(filename, face_index)
            cached_path = self._cached_path(font_id)

            if not os.path.exists(cached_path):
                font.save(cached_path)

            self._fonts[font_id] = SystemFont(
                id=font_id,
                family=_read_name(font, 1) or os.path.splitext(filename)[0],
                style=_read_name(font, 2) or 'Regular',
                weight=_read_weight(font),
                filename=filename,
                cached_path=cached_path,
                face_index=face_index,
                source_format=ext.lstrip('.'),
            )
        finally:
            font.close()

    def _process_collection(self, filepath, filename, ext):
        collection = TTCollection(filepath)
        try:
            for i in range(len(collection)):
                font = collection[i]
                font_id = _make_id(filename, i)
                cached_path = self._cached_path(font_id)

                if not os.path.exists(cached_path):
                    font.save(cached_path)

                self._fonts[font_id] = SystemFont(
                    id=font_id,
                    family=_read_name(font, 1) or os.path.splitext(filename)[0],
                    style=_read_name(font, 2) or 'Regular',
                    weight=_read_weight(font),
                    filename=filename,
                    cached_path=cached_path,
                    face_index=i,
                    source_format=ext.lstrip('.'),
                )
        except Exception:
            logger.warning('Failed to process collection %s', filename, exc_info=True)

    def _cached_path(self, font_id):
        return os.path.join(self.cache_dir, f'{font_id}.ttf')

    def get_all(self):
        return sorted(self._fonts.values(), key=lambda f: (f.family, f.weight))

    def get(self, font_id):
        return self._fonts.get(font_id)

    @property
    def count(self):
        return len(self._fonts)


def _make_id(filename, face_index):
    base = os.path.splitext(filename)[0]
    safe = ''.join(c if c.isalnum() or c in '-_' else '-' for c in base)
    safe = safe.strip('-')
    return f'{safe}_{face_index}'


def _read_name(font, name_id):
    try:
        record = font['name'].getName(nameID=name_id, platformID=3, platEncID=1)
        if record is None:
            record = font['name'].getName(nameID=name_id)
        if record:
            return record.toUnicode()
    except Exception:
        pass
    return None


def _read_weight(font):
    try:
        os2 = font.get('OS/2')
        if os2 is not None:
            return os2.usWeightClass
    except Exception:
        pass
    return 400


_registry = None


def get_registry():
    global _registry
    if _registry is None:
        from config import FONTS_DIR, FONTS_CACHE_DIR
        _registry = FontRegistry(FONTS_DIR, FONTS_CACHE_DIR)
        _registry.scan()
    return _registry

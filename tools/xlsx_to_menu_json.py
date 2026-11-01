"""Rebuild src/data/menu.json from the restaurant's menu sheet.

Usage (needs Python 3 + openpyxl):
    python3 tools/xlsx_to_menu_json.py docs/source/<sheet>.xlsx src/data/menu.json

Works only while the sheet keeps the same layout as WADI_Menu_Modified_2026_25092026.xlsx
(sheet "MENU 2026"; A = section header, B = serial no, C = item, D = price, E = day note).
Name fixes and option grouping live in FIX and O below. After running, re-check the printed
"items / serials covered" line and run the app's tests. Restaurant details at the bottom are fixed text.
"""
import sys, os, json, re
import openpyxl
XLSX, OUT = sys.argv[1], sys.argv[2]
ws = openpyxl.load_workbook(XLSX)['MENU 2026']

# ---------- read rows exactly as in the sheet ----------
rows = []
for r in range(3, ws.max_row + 1):
    A, B, C, D, E = (ws.cell(r, c).value for c in range(1, 6))
    if A and not B:
        rows.append(('H', str(A).strip(), r))
    elif B is not None:
        rows.append(('I', dict(no=str(B).strip(), src=str(C).strip(), price=D, note=(str(E).strip() if E else None), row=r)))
    elif C:  # free text line (happy hour timing)
        rows.append(('T', str(C).strip(), r))

# ---------- naming ----------
SMALL = {'with', 'and', 'or', 'of'}
FIX = {  # clear typos only; every one is listed in MENU_DATA_NOTES.md
    'SAAMBAR': 'Sambar', 'OMLETE': 'Omelette', 'MANJURIAN': 'Manchurian', 'BINDI': 'Bhindi',
    'WEDNSDAY': 'Wednesday', 'POTHIBIRIYANI': 'Pothi Biriyani', 'ALEPPY': 'Alleppey', 'PATHIL': 'Pathal',
    'CHILLI': 'Chilly', 'CKN': 'Chicken',
}
def title(s):
    s = re.sub(r'\s+', ' ', s.strip())
    out = []
    for w in s.split(' '):
        key = w.upper()
        if key in FIX: out.append(FIX[key]); continue
        if w.lower() in SMALL and out: out.append(w.lower()); continue
        out.append('&' if w == '&' else (w[:1].upper() + w[1:].lower()))
    return ' '.join(out)

def num(v):
    if v is None: return None
    if isinstance(v, (int, float)): return int(v) if float(v).is_integer() else round(float(v), 2)
    s = str(v).strip()
    try:
        f = float(s); return int(f) if f.is_integer() else round(f, 2)
    except ValueError: return None
def split_prices(v):
    return [num(p) for p in re.split(r'\s*/\s*', str(v).strip())]

AS_PER_SIZE = 'As per size'

# Explicit overrides keyed by SL NO as written in the sheet.
# kind: 'variants' -> one item, labelled prices; 'split' -> separate items; 'name' -> rename only
O = {
 '6':  dict(name='Poori Bhaji (2 pcs)'),
 '16/17': dict(name='Egg Curry', variants=['Single', 'Double']),
 '18/19': dict(name='Egg Roast', variants=['Single', 'Double']),
 '22/23': dict(name='Omelette', variants=['Single', 'Double']),
 '24': dict(group='vada', name='Vada Set', label='3 pcs'),
 '25': dict(group='vada', name='Vada Set', label='2 pcs'),
 '27/28': dict(name='Cutlet', variants=['Beef', 'Chicken'], same_price=True),
 '29/30': dict(name='Samoosa', variants=['Veg', 'Chicken']),
 '33': dict(name='Parippu Vada (Dal Vada)'),
 '35': dict(name='Chatti Pathiri (Sweet)'),
 '36': dict(name='Kaipola (Sweet)'),
 '37': dict(name='Pazham Pori (Banana Fry)'),
 '45/46': dict(split=['Black Tea', 'Lime Tea'], same_price=True),
 '48/49': dict(split=['Coffee', 'Special Coffee']),
 '50/51': dict(split=['Horlicks', 'Boost'], same_price=True),
 '62': dict(group='pothi-biriyani', name='Pothi Biriyani', label='Chicken'),
 '63': dict(group='pothi-biriyani', name='Pothi Biriyani', label='Beef'),
 '64': dict(group='pothi-biriyani', name='Pothi Biriyani', label='Mutton'),
 '65': dict(group='pothi-biriyani', name='Pothi Biriyani', label='Fish'),
 '66': dict(name='Meals (Veg / Non-Veg)', options='Barik or Motta rice'),
 '68': dict(name='Plain Rice', options='Motta or Barik'),
 '71': dict(name='Pothichoru Special'),
 '72/73/74': dict(name='Chatti Choru', variants=['Fish', 'Chicken', 'Beef']),
 '76/77': dict(name='Palli Choru', variants=['Beef', 'Chicken']),
 '78': dict(name='Erachi Choru (Beef)'),
 '83': dict(name='Fish Chatty Curry', options='Ayala or King Fish'),
 '84': dict(name='Fish Mango Curry', options='Ayala or King Fish'),
 '88': dict(group='ilayil', name='Ilayil Pollichath', label='King Fish'),
 '89': dict(group='ilayil', name='Ilayil Pollichath', label='Mathi (3 pcs)'),
 '90': dict(group='ilayil', name='Ilayil Pollichath', label='Sherry'),
 '93/94': dict(name='Fish Dry Fry', variants=['Mathi', 'King Fish']),
 '95': dict(name='King Fish Masala (Single)'),
 '100': dict(group='hot-sour', name='Hot & Sour Soup', label='Mutton'),
 '101': dict(group='hot-sour', name='Hot & Sour Soup', label='Chicken'),
 '102': dict(group='hot-sour', name='Hot & Sour Soup', label='Vegetable'),
 '103': dict(group='manchow', name='Manchow Soup', label='Mutton'),
 '104': dict(group='manchow', name='Manchow Soup', label='Chicken'),
 '112/113': dict(name='Gobi Manchurian', variants=['Small', 'Big']),
 '114/115': dict(name='Chilly Gobi', variants=['Small', 'Big']),
 '116': dict(name='Mixed Fried Rice', variants=['Normal', 'Schezwan']),
 '117': dict(name='Beef Fried Rice', variants=['Normal', 'Schezwan']),
 '118': dict(name='Chicken Fried Rice', variants=['Normal', 'Schezwan']),
 '119': dict(name='Egg Fried Rice', variants=['Normal', 'Schezwan']),
 '120': dict(name='Veg Fried Rice', variants=['Normal', 'Schezwan']),
 '121': dict(name='Mixed Noodles', variants=['Normal', 'Schezwan']),
 '122': dict(name='Chicken Noodles', variants=['Normal', 'Schezwan']),
 '123': dict(name='Veg Noodles', variants=['Normal', 'Schezwan']),
 '124': dict(name='Egg Noodles', variants=['Normal', 'Schezwan']),
 '128/129': dict(name='Chicken Lollipop', variants=['Dry', 'Gravy']),
 '130/131': dict(name='Chicken Kaandhari', variants=['Small', 'Big']),
 '134': dict(name='Wadi Kada Fry (2 pcs)'),
 '140': dict(name='Rappayi Chicken Fry', variants=[None, None], confirm='Two prices (16 / 24) with no size labels in the sheet'),
 '156': dict(name='Butter Chicken (Boneless)'),
 '206': dict(name='Chapathi (Special)', confirm='"SP" read as Special'),
 '214': dict(group='kizhi-dosa', name='Kizhi Thattu Dosa', label='Chicken'),
 '215': dict(group='kizhi-dosa', name='Kizhi Thattu Dosa', label='Beef'),
 '216': dict(name='Puthiyappla Kozhi (Full)'),
 '217': dict(name='Kallil Chutta Chicken (Normal)'),
 '218': dict(name='Kallil Chutta Chicken (Pepper)'),
 '219': dict(group='pothi-porotta', name='Pothi Porotta', label='Chicken'),
 '220': dict(group='pothi-porotta', name='Pothi Porotta', label='Beef'),
 '221': dict(group='kizhi-porotta', name='Kizhi Porotta', label='Chicken'),
 '222': dict(group='kizhi-porotta', name='Kizhi Porotta', label='Beef'),
 '223': dict(name='Kariveppila Chicken'),
 '226': dict(group='kappa-biriyani', name='Kappa Biriyani', label='Chicken'),
 '227': dict(group='kappa-biriyani', name='Kappa Biriyani', label='Beef'),
 '228': dict(group='nadan-fry', name='Chicken Nadan Fry', label='Half'),
 '229': dict(group='nadan-fry', name='Chicken Nadan Fry', label='Full'),
 '231': dict(group='kothu', name='Kothu Porotta', label='Chicken'),
 '232': dict(group='kothu', name='Kothu Porotta', label='Beef'),
 '233': dict(group='kothu', name='Kothu Porotta', label='Egg'),
 '234': dict(group='kothu', name='Kothu Porotta', label='Veg'),
 '242': dict(group='wrap', name='Porotta Wrap', label='Chicken'),
 '243': dict(group='wrap', name='Porotta Wrap', label='Beef'),
 '244': dict(group='wrap', name='Porotta Wrap', label='Egg Omelette'),
 '245': dict(group='wrap', name='Porotta Wrap', label='Boiled Egg'),
 '246': dict(name='Sweet Lassi'),
 '251': dict(group='soft', name='Soft Drink', label='Can'),
 '252': dict(group='soft', name='Soft Drink', label='Chottu'),
}
# NB: '223' source is "KARI VEPPILA CHICKEN"; printed menus use "Kariveppila Chicken" (one word) -> applied.

DAYS = {'SUNDAY': ['sun'], 'MONDAY': ['mon'], 'TUESDAY': ['tue'], 'WEDNSDAY': ['wed'], 'WEDNESDAY': ['wed'],
        'THURSDAY': ['thu'], 'FRIDAY': ['fri'], 'SATURDAY': ['sat'],
        'THURSDAY & SATURDAY ONLY': ['thu', 'sat'], 'FRIDAY & SUNDAY ONLY': ['fri', 'sun']}

NONVEG = r'\b(chicken|beef|mutton|fish|prawns?|crab|squid|egg|kheema|omelette|ayala|mathi|king fish|kozhi|majboos|erachi|cutlet|pothin kaal|sherry)\b'
VEG_WORDS = r'\b(veg|vegetable|paneer|gobi|mushroom|dal|alu|channa|bhindi|green peas|tomato|french fries|sambar|kadala|cherupayar|bhaji)\b'
VEG_STAPLES = {'Masala Dosa', 'Ghee Roast', 'Set Dosa', 'Plain Roast', 'Idly Set', 'Idly Vada Set', 'Uthappam Set', 'Puttu',
               'Vada Set', 'Parippu Vada (Dal Vada)', 'Pakkavada', 'Pazham Pori (Banana Fry)', 'Masala Bonda', 'Sweet Bonda',
               'Chapathi (Special)', 'Thattu Dosa', 'Wheat Dosa', 'Appam', 'Idiyappam', 'Ari Rotti'}
def diet(name, labels=()):
    t = ' '.join([name] + [l or '' for l in labels]).lower()
    if 'veg / non-veg' in t: return None
    nv = bool(re.search(NONVEG, t)); v = bool(re.search(VEG_WORDS, t)) or name in VEG_STAPLES
    if labels and nv and v: return None          # mixed variants (e.g. Samoosa veg/chicken, Kothu Porotta)
    if nv: return 'non-veg'
    if v: return 'veg'
    return None

def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

# ---------- structure (top-level headers in the sheet) ----------
GROUPS = [
 ('breakfast', 'Breakfast', ['BREAKFAST']),
 ('tea-snacks', 'Tea & Snacks', ['TEA & SNACKS']),
 ('lunch', 'Lunch', ['LUNCH']),
 ('daily-specials', 'Wadi Daily Specials', ['WADI DAILY SPECIALS']),
 ('fish-specials', 'Fish Specials', ['FISH SPECIALS']),
 ('chinese-soups', 'Chinese & Soups', ['CHINESE & SOUPS']),
 ('fried-rice-noodles', 'Fried Rice & Noodles', ['FRIED RICE & NOODLES']),
 ('dinner', 'Dinner', ['STARTER', 'CHICKEN', 'BEEF', 'MUTTON', 'VEG', 'BREAD ITEMS', 'THATTIKOOTTU SPECIAL', 'MALLUS THATTIKOOTTU SPECIAL']),
 ('happy-hour', 'Happy Hour Combo', ['Combos', 'Sandwiches']),
 ('drinks', 'Drinks & Juices', ['DRINKS & JUICES']),
]
SECTION_TITLES = {'STARTER': 'Starters', 'VEG': 'Veg', 'BREAD ITEMS': 'Bread', 'Sandwiches': 'Porotta Wraps',
                  'THATTIKOOTTU SPECIAL': 'Thattikoottu Special', 'MALLUS THATTIKOOTTU SPECIAL': 'Mallus Thattikoottu Special',
                  'WADI DAILY SPECIALS': 'Wadi Daily Specials'}
IMAGES = {'lunch': 'biryani-handi', 'fried-rice-noodles': 'fried-rice', 'thattikoottu-special': 'kizhi-porotta'}

# walk rows into raw sections
sections = []; cur = None; texts = {}
for kind, val, *rest in rows:
    if kind == 'H':
        if val in ('DINNER', 'HAPPY HOUR COMBO'): continue
        cur = dict(key=val, items=[]); sections.append(cur)
    elif kind == 'T':
        texts['happy'] = val
    else:
        cur['items'].append(val)

def build_items(raw):
    items = []; pending = {}
    for it in raw:
        o = O.get(it['no'], {})
        no_parts = [p.strip() for p in it['no'].split('/')]
        avail = DAYS.get(it['note'].upper()) if it['note'] else None
        base_name = o.get('name') or title(it['src'])
        price_raw = it['price']
        if isinstance(price_raw, str) and price_raw.strip().upper() == 'AS PER SIZE':
            prices = [None]; note = AS_PER_SIZE
        else:
            prices = split_prices(price_raw) if isinstance(price_raw, str) else [num(price_raw)]; note = None
        if 'group' in o:   # merge consecutive rows into one item with variants
            g = pending.get(o['group'])
            v = {'label': o['label'], 'price': prices[0], 'no': it['no']}
            if note: v['priceNote'] = note
            if g is None:
                g = {'id': slug(o['name']), 'name': o['name'], 'source': [it['src']], 'variants': [v]}
                pending[o['group']] = g; items.append(g)
            else:
                g['variants'].append(v); g['source'].append(it['src'])
            continue
        if 'split' in o:
            ps = prices * len(o['split']) if o.get('same_price') else prices
            for n, nm, p in zip(no_parts, o['split'], ps):
                items.append({'id': slug(nm), 'no': n, 'name': nm, 'source': it['src'], 'price': p})
            continue
        item = {'id': slug(base_name), 'no': it['no'], 'name': base_name, 'source': it['src']}
        if 'variants' in o:
            labels = o['variants']
            ps = prices * len(labels) if o.get('same_price') else prices
            assert len(ps) == len(labels), (it, ps, labels)
            nos = no_parts if len(no_parts) == len(labels) else [None] * len(labels)
            item['variants'] = []
            for l, p, n in zip(labels, ps, nos):
                v = {'label': l, 'price': p}
                if n: v['no'] = n
                item['variants'].append(v)
            if len(no_parts) == len(labels): del item['no']
        else:
            assert len(prices) == 1, it
            item['price'] = prices[0]
            if note: item['priceNote'] = note
        if o.get('options'): item['options'] = o['options']
        if avail: item['availableDays'] = avail
        if o.get('confirm'): item['confirm'] = o['confirm']
        items.append(item)
    for g in items:
        if isinstance(g.get('source'), list): g['source'] = ' | '.join(g['source'])
        labels = [v.get('label') for v in g.get('variants', [])]
        g['diet'] = diet(g['name'], labels)
    return items

out_groups = []
by_key = {s['key']: s for s in sections}
seen_ids = set()
for gid, gtitle, keys in GROUPS:
    secs = []
    for k in keys:
        s = by_key[k]
        st = SECTION_TITLES.get(k, title(k))
        sid = slug(st)
        items = build_items(s['items'])
        for it in items:
            base = it['id']; n = 2
            while it['id'] in seen_ids: it['id'] = f'{base}-{n}'; n += 1
            seen_ids.add(it['id'])
        sec = {'id': sid, 'title': st, 'items': items}
        if sid in IMAGES or gid in IMAGES and len(keys) == 1:
            sec['image'] = IMAGES.get(sid) or IMAGES.get(gid)
        secs.append(sec)
    g = {'id': gid, 'title': gtitle, 'sections': secs}
    if gid == 'happy-hour':
        g['note'] = '4:00 PM to 7:00 PM, weekdays only'
        g['window'] = {'days': ['mon', 'tue', 'wed', 'thu', 'fri'], 'from': '16:00', 'to': '19:00'}
        g['source'] = texts.get('happy')
    out_groups.append(g)

menu = {
  'meta': {
    'source': 'WADI_Menu_Modified_2026_25092026.xlsx (sheet "MENU 2026", columns A to E only)',
    'sourceDate': '2026-09-25',
    'currency': 'AED',
    'timezone': 'Asia/Dubai',
    'excluded': 'Talabat columns F to H (listing flag, +28% delivery-app markup) are internal and not used',
  },
  'restaurant': {
    'name': 'Arous Al Wadi Restaurant',
    'nameAr': 'مطعم عروس الوادي',
    'logoTaglineMl': 'തട്ടിക്കൂട്ട്',
    'area': 'Al Nahda, Sharjah',
    'address': 'Bukhara Street, Al Nahda, Sharjah, United Arab Emirates',
    'geo': {'lat': 25.3016037, 'lng': 55.3795801},
    'mapsUrl': 'https://maps.app.goo.gl/rke6DTnZ3HSgGzZq8',
    'hours': {'daily': {'open': '06:00', 'close': '24:00'}, 'source': 'Google Maps listing, confirm with restaurant'},
    'phones': [
      {'label': 'Restaurant', 'display': '06 536 3600', 'tel': '+97165363600'},
      {'label': 'Mobile', 'display': '050 653 9192', 'tel': '+971506539192'},
    ],
    'whatsapp': None,
    'email': 'alwadi.nms@gmail.com',
    'freeHomeDelivery': True,
  },
  'groups': out_groups,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f: json.dump(menu, f, ensure_ascii=False, indent=2)

# ---------- report ----------
cnt = 0; nos = []
for g in out_groups:
    for s in g['sections']:
        for it in s['items']:
            cnt += 1
            if 'no' in it: nos += it['no'].split('/')
            for v in it.get('variants', []):
                if v.get('no'): nos += v['no'].split('/')
print('items', cnt, 'serials covered', len(set(nos)))
missing = sorted(set(str(i) for i in range(1, 253)) - set(nos), key=int); print('serials not referenced', missing)

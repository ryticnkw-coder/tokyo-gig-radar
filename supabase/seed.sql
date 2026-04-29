-- 主要会場の初期データ
insert into venues (name, name_en, area, address, capacity, website_url, scrape_url) values
  -- クラブ系
  ('LIQUIDROOM',        'LIQUIDROOM',         '恵比寿',   '東京都渋谷区東3-16-6',           900,  'https://www.liquidroom.net',        'https://www.liquidroom.net/schedule'),
  ('WWW',               'WWW',                '渋谷',     '東京都渋谷区宇田川町13-17',       400,  'https://www-shibuya.jp',            'https://www-shibuya.jp/schedule/'),
  ('WWW X',             'WWW X',              '渋谷',     '東京都渋谷区宇田川町13-17',       700,  'https://www-shibuya.jp',            'https://www-shibuya.jp/schedule/'),
  ('Contact Tokyo',     'Contact',            '渋谷',     '東京都渋谷区円山町2-11',          300,  'https://contact-tokyo.com',         null),
  ('WOMB',              'WOMB',               '渋谷',     '東京都渋谷区円山町2-16',          700,  'https://www.womb.co.jp',            null),
  ('UNIT',              'UNIT',               '代官山',   '東京都渋谷区代官山町13-8',        700,  'https://www.unit-tokyo.com',        null),
  ('Circus Tokyo',      'Circus Tokyo',       '渋谷',     '東京都渋谷区渋谷1-23-16',        300,  'https://circus-tokyo.jp',           null),
  ('DOMMUNE',           'DOMMUNE',            '渋谷',     '東京都渋谷区桜丘町23-3',          null, 'https://www.dommune.com',           null),
  -- インディー系
  ('SHELTER',           'Shimokitazawa SHELTER', '下北沢', '東京都世田谷区北沢2-6-10',       200,  'https://www.loft-prj.co.jp/SHELTER', null),
  ('BASEMENT BAR',      'Shimokitazawa BASEMENT BAR', '下北沢', '東京都世田谷区北沢2-11-2', 150,  null,                                null),
  ('FEVER',             'Shindaita FEVER',    '新代田',   '東京都世田谷区代田2-31-20',       250,  'https://www.fever-popo.com',        null),
  ('CLUB QUATTRO',      'Shibuya CLUB QUATTRO', '渋谷',   '東京都渋谷区宇田川町32-13',      800,  'https://www.club-quattro.com/shibuya', null),
  ('duo MUSIC EXCHANGE','duo MUSIC EXCHANGE', '渋谷',     '東京都渋谷区道玄坂2-14-8',       700,  'https://duomusicexchange.com',      null),
  ('渋谷O-EAST',        'Shibuya O-EAST',     '渋谷',     '東京都渋谷区道玄坂2-14-8',      1300,  'https://shibuya-o.com',             null),
  ('渋谷O-WEST',        'Shibuya O-WEST',     '渋谷',     '東京都渋谷区円山町2-3',           700,  'https://shibuya-o.com',             null),
  ('新宿LOFT',          'Shinjuku LOFT',      '新宿',     '東京都新宿区歌舞伎町1-12-9',      550,  'https://www.loft-prj.co.jp/LOFT',  null),
  ('新宿MARZ',          'Shinjuku MARZ',      '新宿',     '東京都新宿区歌舞伎町2-14-6',      250,  null,                                null)
on conflict do nothing;

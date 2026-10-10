-- ============================================================
-- SAMPLE DATA for the prototype. Coordinates are approximate; carrying capacities,
-- visitor counts, festival dates and guidelines are ILLUSTRATIVE and must be replaced
-- with figures from tourism departments and community councils before real use.
-- ============================================================

-- Seed rows bypass the per-user triggers (they would force 'pending' / unpublished).
alter table public.reports disable trigger reports_insert;
alter table public.heritage_sites disable trigger heritage_publish;
alter table public.events disable trigger events_publish;

insert into public.destinations
  (slug, name, state_code, district, place, kind, ecosystem, lat, lng, summary, culture, etiquette, facts, aliases,
   is_lesser_known, sensitivity, carrying_capacity, access, is_published)
values
  ('nongriat', 'Double-Decker Root Bridge', 'ML', 'East Khasi Hills', 'Nongriat · East Khasi Hills, Meghalaya', 'heritage',
   'Subtropical forest · living root bridges', 25.2486, 91.6730,
   'Two-tier living root bridge grown by Khasi villagers, reached by ~3,000 steps from Tyrna.',
   'The bridges are living community heritage. Stay off the roots, carry all waste back up and ask before photographing residents.',
   array['Stay off the roots', 'Carry all waste back up', 'Ask before photographing residents'],
   '[["Best time","Oct – Apr"],["Access","~3,000 steps from Tyrna"],["Trek time","2–3 h down, more up"],["Facilities","Village homestays, no ATM"]]',
   array['nongriat','root','bridge','double','tyrna','living'], false, 'high', 600,
   '{"road":"Road to Tyrna, then steps only","transport":["Shared taxi to Sohra","Taxi to Tyrna"],"nearest_town":"Sohra","distance_km":12,"connectivity":"2g","medical_km":14,"permit":null}', true),

  ('nohkalikai', 'Nohkalikai Falls', 'ML', 'East Khasi Hills', 'Sohra · East Khasi Hills, Meghalaya', 'nature',
   'Plateau escarpment waterfall', 25.2753, 91.6869,
   'One of India''s tallest plunge waterfalls, seen from a roadside viewpoint near Sohra.',
   'The falls carry a Khasi legend that locals tell with care. Stay behind the viewpoint railing, and ask a Ranger guide for the story instead of trusting a sign.',
   array['Stay behind the railing', 'Use the bins or carry waste back'],
   '[["Best time","Jun – Oct for flow"],["Access","Road to viewpoint"],["From Shillong","~2 h by road"],["Facilities","Parking, stalls, toilets"]]',
   array['nohkalikai','sohra','cherrapunji','cherrapunjee','falls','waterfall'], false, 'medium', 2500,
   '{"road":"Paved, one lane in places","transport":["Taxi from Shillong","Shared taxi to Sohra"],"nearest_town":"Sohra","distance_km":5,"connectivity":"4g","medical_km":6,"permit":null}', true),

  ('dawki', 'Umngot River', 'ML', 'West Jaintia Hills', 'Dawki & Shnongpdeng · West Jaintia Hills', 'nature',
   'Riverine · clear-water river', 25.1867, 92.0217,
   'Famously clear river at the Bangladesh border, with boating at Dawki and Shnongpdeng.',
   'The river feeds the villages along it. Use no soap or detergent in the water, and follow the boatmen''s association rules on timings and life jackets.',
   array['No soap or detergent in the river', 'Life jackets on all boats', 'Camp only where villages allow'],
   '[["Best time","Nov – Apr (clear water)"],["Access","Road + boat stands"],["Activities","Boating, kayaking"],["Facilities","Homestays at Shnongpdeng"]]',
   array['dawki','umngot','shnongpdeng','river','boat','jaintia'], false, 'high', 1500,
   '{"road":"NH 206, steep descent","transport":["Taxi from Shillong"],"nearest_town":"Dawki","distance_km":2,"connectivity":"4g","medical_km":3,"permit":null}', true),

  ('krang-suri', 'Krang Suri Falls', 'ML', 'West Jaintia Hills', 'Amlarem · West Jaintia Hills, Meghalaya', 'nature',
   'Limestone waterfall with blue pools', 25.3263, 92.1453,
   'A quieter waterfall with turquoise pools, managed by the local village.',
   'Village-managed site with an entry fee that funds upkeep. Swim only where the caretakers allow.',
   array['Pay the village entry fee', 'Swim only in marked areas'],
   '[["Best time","Oct – May"],["Access","Road + short steps"]]',
   array['krang','suri','amlarem','jaintia'], true, 'medium', 800,
   '{"road":"Paved to car park","transport":["Taxi from Jowai"],"nearest_town":"Jowai","distance_km":28,"connectivity":"2g","medical_km":25,"permit":null}', true),

  ('laitlum', 'Laitlum Canyons', 'ML', 'East Khasi Hills', 'Smit · East Khasi Hills, Meghalaya', 'nature',
   'Montane grassland ridge and gorges', 25.4610, 91.9660,
   'Grassy ridge above deep gorges, with steps down to Rasong village.',
   'Rasong village sits below the ridge. Keep to the steps and don''t fly drones over homes.',
   array['Keep to the steps', 'No drones over homes'],
   '[["Best time","Oct – Apr"],["Access","Road to ridge"]]',
   array['laitlum','smit','canyon','rasong'], true, 'medium', 700,
   '{"road":"Paved, narrow last stretch","transport":["Taxi from Shillong"],"nearest_town":"Shillong","distance_km":25,"connectivity":"4g","medical_km":22,"permit":null}', true),

  ('majuli', 'Majuli River Island', 'AS', 'Majuli', 'Majuli · Brahmaputra, Assam', 'cultural',
   'River island · Brahmaputra floodplain', 26.9500, 94.1700,
   'River island and centre of neo-Vaishnavite satras, shrinking from erosion.',
   'The satras are living monasteries. Dress modestly, remove shoes where asked and follow the timings of prayers.',
   array['Dress modestly at satras', 'Remove shoes where asked', 'Respect prayer timings'],
   '[["Best time","Oct – Mar"],["Access","Ferry from Nimati Ghat"]]',
   array['majuli','satra','brahmaputra','island'], false, 'critical', 1200,
   '{"road":"Ferry, then island roads","transport":["Ferry from Jorhat (Nimati)"],"nearest_town":"Garamur","distance_km":5,"connectivity":"4g","medical_km":8,"permit":null}', true),

  ('kaziranga', 'Kaziranga National Park', 'AS', 'Golaghat', 'Kohora · Golaghat, Assam', 'wildlife',
   'Floodplain grassland · one-horned rhino habitat', 26.5775, 93.1711,
   'UNESCO-listed park and stronghold of the one-horned rhinoceros. Closed in the monsoon.',
   'Safaris follow park rules. Stay in the vehicle, keep quiet and never feed animals.',
   array['Stay in the vehicle', 'No feeding animals', 'Book safaris through approved counters'],
   '[["Best time","Nov – Apr"],["Season","Closed in the monsoon"]]',
   array['kaziranga','rhino','kohora','safari'], false, 'high', 3000,
   '{"road":"NH 715","transport":["Bus from Guwahati","Taxi from Jorhat"],"nearest_town":"Bokakhat","distance_km":20,"connectivity":"4g","medical_km":20,"permit":"Park entry + safari ticket"}', true),

  ('ziro', 'Ziro Valley', 'AR', 'Lower Subansiri', 'Ziro · Lower Subansiri, Arunachal Pradesh', 'cultural',
   'Pine-covered valley · paddy-cum-fish fields', 27.5450, 93.8290,
   'Home of the Apatani, whose wet-rice and fish farming is famed for sustainability.',
   'Apatani villages are private homes. Ask before entering or photographing, especially elders.',
   array['Ask before entering homes', 'Ask before photographing elders'],
   '[["Best time","Mar – Oct"],["Permit","Inner Line Permit"]]',
   array['ziro','apatani','hong','subansiri'], false, 'high', 1000,
   '{"road":"Hill road from Itanagar","transport":["Shared sumo from Itanagar"],"nearest_town":"Hapoli","distance_km":5,"connectivity":"4g","medical_km":6,"permit":"Inner Line Permit"}', true),

  ('tawang', 'Tawang Monastery', 'AR', 'Tawang', 'Tawang, Arunachal Pradesh', 'heritage',
   'High-altitude Himalayan valley', 27.5859, 91.8594,
   'One of the largest Buddhist monasteries in India, reached over Sela Pass.',
   'An active monastery. Walk clockwise, keep voices low and ask before photographing monks.',
   array['Walk clockwise', 'Ask before photographing monks'],
   '[["Best time","Mar – Jun, Sep – Nov"],["Permit","Inner Line Permit"]]',
   array['tawang','monastery','sela'], false, 'medium', 2500,
   '{"road":"Long hill road via Sela Pass","transport":["Shared sumo from Tezpur"],"nearest_town":"Tawang","distance_km":2,"connectivity":"4g","medical_km":3,"permit":"Inner Line Permit"}', true),

  ('dzukou', 'Dzükou Valley', 'NL', 'Kohima', 'Viswema · Kohima, Nagaland', 'nature',
   'Montane valley · bamboo-grass meadows', 25.5580, 94.0790,
   'High valley of rolling meadows, reached on foot. Sensitive to fires and litter.',
   'Managed by local village councils. Carry out all waste and never light fires outside the rest house.',
   array['Carry out all waste', 'No fires outside the rest house', 'Register with the village council'],
   '[["Best time","Jun – Sep (flowers), Oct – Mar (clear)"],["Access","3–4 h trek from Viswema"]]',
   array['dzukou','dzuko','viswema','zakhama'], false, 'critical', 300,
   '{"road":"Road to trailhead, then trek","transport":["Taxi from Kohima"],"nearest_town":"Kohima","distance_km":30,"connectivity":"none","medical_km":30,"permit":"Inner Line Permit"}', true),

  ('khonoma', 'Khonoma Green Village', 'NL', 'Kohima', 'Khonoma · Kohima, Nagaland', 'village',
   'Terraced hills · community-conserved forest', 25.6530, 94.0240,
   'Angami village that banned hunting and protects its forests as a community.',
   'Hunting and logging are banned here by the village itself. Hire village guides and stay in homestays.',
   array['Hire village guides', 'Stay in homestays'],
   '[["Best time","Oct – May"]]',
   array['khonoma','angami','green village'], true, 'high', 400,
   '{"road":"Hill road from Kohima","transport":["Taxi from Kohima"],"nearest_town":"Kohima","distance_km":20,"connectivity":"2g","medical_km":20,"permit":"Inner Line Permit"}', true),

  ('loktak', 'Loktak Lake & Keibul Lamjao', 'MN', 'Bishnupur', 'Moirang · Bishnupur, Manipur', 'eco',
   'Wetland · floating phumdis', 24.5000, 93.8000,
   'Largest freshwater lake in the Northeast, with floating phumdis and the only floating national park.',
   'Fishing communities live on the phumdis. Use local boats and never disturb the floating huts.',
   array['Use local boats', 'Don''t disturb floating huts', 'No plastic on the lake'],
   '[["Best time","Oct – Mar"]]',
   array['loktak','phumdi','keibul','sangai','moirang'], false, 'critical', 1500,
   '{"road":"Paved from Imphal","transport":["Taxi from Imphal"],"nearest_town":"Moirang","distance_km":8,"connectivity":"4g","medical_km":10,"permit":null}', true),

  ('phawngpui', 'Phawngpui (Blue Mountain)', 'MZ', 'Lawngtlai', 'Sangau · Lawngtlai, Mizoram', 'nature',
   'Montane forest · national park', 22.6333, 93.0333,
   'Mizoram''s highest peak, held sacred in local belief and protected as a national park.',
   'A sacred mountain in Mizo tradition. Keep to trails and camp only with park permission.',
   array['Keep to trails', 'Camp only with permission'],
   '[["Best time","Oct – Apr"]]',
   array['phawngpui','blue mountain','sangau'], true, 'high', 250,
   '{"road":"Rough last stretch","transport":["Jeep from Lawngtlai"],"nearest_town":"Sangau","distance_km":10,"connectivity":"2g","medical_km":40,"permit":"Inner Line Permit"}', true),

  ('unakoti', 'Unakoti Rock Carvings', 'TR', 'Unakoti', 'Kailashahar · Unakoti, Tripura', 'heritage',
   'Forested hillside · rock-cut reliefs', 24.3167, 92.0667,
   'Giant rock-cut Shaivite reliefs from around the 8th–9th centuries, in the forest.',
   'Protected monument and active pilgrimage site. Don''t climb on or touch the carvings.',
   array['Don''t touch or climb carvings', 'No littering at the site'],
   '[["Best time","Oct – Mar"]]',
   array['unakoti','kailashahar','carvings'], true, 'medium', 1500,
   '{"road":"Paved","transport":["Taxi from Kailashahar"],"nearest_town":"Kailashahar","distance_km":8,"connectivity":"4g","medical_km":9,"permit":null}', true),

  ('tsomgo', 'Tsomgo Lake', 'SK', 'Gangtok', 'East Sikkim', 'nature',
   'Glacial lake · alpine', 27.3747, 88.7639,
   'Sacred glacial lake at about 3,750 m. Permit-controlled with a daily cap on vehicles.',
   'Sacred to local Buddhists and Hindus. Don''t throw anything into the lake.',
   array['Nothing into the lake', 'Carry warm layers and acclimatise'],
   '[["Best time","Mar – May, Oct – Dec"],["Permit","Protected Area Permit"]]',
   array['tsomgo','changu','nathula'], false, 'critical', 2000,
   '{"road":"Mountain road, snow closures","transport":["Permit taxi from Gangtok"],"nearest_town":"Gangtok","distance_km":38,"connectivity":"2g","medical_km":38,"permit":"Protected Area Permit"}', true);

-- Seasonal suitability by month (Jan..Dec): G good, F fair, P poor, C closed.
with pattern(slug, p) as (values
  ('nongriat', 'GGGGFPPPFGGG'), ('nohkalikai', 'FFFFFGGGGGFF'), ('dawki', 'GGGGFPPPFGGG'),
  ('krang-suri', 'GGGGGFFFFGGG'), ('laitlum', 'GGGGFPPPFGGG'), ('majuli', 'GGGFPPPPFGGG'),
  ('kaziranga', 'GGGGFCCCCFGG'), ('ziro', 'FFGGGGGGGGFF'), ('tawang', 'PPGGGFFFGGGP'),
  ('dzukou', 'FFGGGGGGGGGF'), ('khonoma', 'GGGGGFFFFGGG'), ('loktak', 'GGGFFPPPFGGG'),
  ('phawngpui', 'GGGGFPPPFGGG'), ('unakoti', 'GGGGFPPPFGGG'), ('tsomgo', 'PPGGGFPPFGGF')
)
insert into public.seasonal_conditions (destination_id, month, suitability, note)
select d.id, m.n,
  (case m.c when 'G' then 'good' when 'F' then 'fair' when 'P' then 'poor' else 'closed' end)::public.suitability,
  case m.c when 'P' then 'Monsoon / weather limits access' when 'C' then 'Closed to visitors' else '' end
from pattern
join public.destinations d on d.slug = pattern.slug
cross join lateral (
  select ord::smallint as n, ch as c from unnest(string_to_array(pattern.p, null)) with ordinality as t(ch, ord)
) m;

-- Indicators: pilot values from the website, a baseline for the rest.
insert into public.indicators (destination_id, kind, label, value, level, source)
select d.id, i.kind, i.label, i.value, i.level::public.level, i.source
from (values
  ('nongriat', 'weather', 'Weather risk', 'Moderate', 'warn', 'IMD district forecast'),
  ('nongriat', 'access', 'Accessibility', 'Trail open', 'good', 'Ranger report · verified'),
  ('nongriat', 'eco', 'Eco sensitivity', 'High', 'high', 'Destination profile'),
  ('nongriat', 'pressure', 'Visitor pressure', 'Not verified', 'none', 'No reliable count, so we won''t guess'),
  ('nohkalikai', 'weather', 'Weather risk', 'Fog likely', 'warn', 'IMD + Ranger observation'),
  ('nohkalikai', 'access', 'Accessibility', 'Slow, one lane', 'high', 'Ranger report · verified'),
  ('nohkalikai', 'eco', 'Eco sensitivity', 'Moderate', 'warn', 'Destination profile'),
  ('nohkalikai', 'pressure', 'Visitor pressure', 'Busy weekends', 'warn', 'Entry records (simulated)'),
  ('dawki', 'weather', 'Weather risk', 'Low', 'good', 'IMD district forecast'),
  ('dawki', 'access', 'Accessibility', 'Boating open', 'good', 'Ranger report · verified'),
  ('dawki', 'eco', 'Eco sensitivity', 'High', 'high', 'River ecosystem profile'),
  ('dawki', 'pressure', 'Visitor pressure', 'High', 'high', 'Boat-stand counts (simulated)')
) as i(slug, kind, label, value, level, source)
join public.destinations d on d.slug = i.slug;

insert into public.indicators (destination_id, kind, label, value, level, source)
select d.id, 'eco', 'Eco sensitivity', initcap(d.sensitivity::text),
  (case d.sensitivity when 'low' then 'good' when 'medium' then 'warn' else 'high' end)::public.level, 'Destination profile'
from public.destinations d
where d.slug not in ('nongriat', 'nohkalikai', 'dawki');

insert into public.recommendations (destination_id, body, meta)
select d.id, r.body, r.meta
from (values
  ('nongriat', 'Start down from Tyrna before 8 am. The steps are dry and the trail is open as of this morning, but afternoon showers are likely and wet steps are slow going. There are no bins below the village, so pack out what you bring. If you plan to stay overnight, book a Nongriat homestay rather than camping near the pools.', 'Based on 4 sources'),
  ('nohkalikai', 'Plan to arrive around 11 am, when the fog usually lifts. A verified Ranger report shows a small slip about 4 km before Sohra, with one-lane traffic, so allow an extra 30 minutes. Weekends are busiest. A weekday visit means more time at the railing and less waiting at parking.', 'Based on 4 sources'),
  ('dawki', 'This is peak clear-water season, and it''s busy. Go on a weekday morning for fewer boats and calmer water. Stay at a Shnongpdeng homestay instead of camping on the sandbanks, which are under pressure this season. Life jackets are mandatory on all boats.', 'Based on 4 sources')
) as r(slug, body, meta)
join public.destinations d on d.slug = r.slug;

-- Simulated daily visitor counts for the last 60 days: weekends busier, base load varies by site.
insert into public.visitor_counts (destination_id, day, visitors, source)
select d.id, g.day::date,
  greatest(0, round(
    d.carrying_capacity * l.base
    * case when extract(isodow from g.day) >= 6 then 1.45 else 0.85 end
    * (0.85 + 0.3 * ((('x' || substr(md5(d.slug || g.day::text), 1, 6))::bit(24)::int) / 16777215.0))
  ))::int,
  'simulated'
from public.destinations d
join (values
  ('nongriat', 0.75), ('nohkalikai', 0.7), ('dawki', 0.95), ('krang-suri', 0.35), ('laitlum', 0.3),
  ('majuli', 0.5), ('kaziranga', 0.65), ('ziro', 0.4), ('tawang', 0.55), ('dzukou', 0.8),
  ('khonoma', 0.25), ('loktak', 0.45), ('phawngpui', 0.2), ('unakoti', 0.25), ('tsomgo', 0.85)
) as l(slug, base) on l.slug = d.slug
cross join generate_series(current_date - 60, current_date - 1, interval '1 day') as g(day);

-- Reports from the website's pilot feed (seeded, no author).
insert into public.reports (destination_id, category, body, status, source, source_label, created_at)
select d.id, r.category::public.report_category, r.body, r.status::public.report_status, r.source, r.label, now() - r.ago::interval
from (values
  ('nongriat', 'trail', 'Steps clear and dry down to the bridge. Two guides on the route this morning.', 'verified', 'ranger', 'Ranger · Tyrna', '2 hours'),
  ('nongriat', 'weather', 'Light to moderate rain likely in the afternoon.', 'official', 'official', 'IMD · East Khasi Hills', '4 hours'),
  ('nongriat', 'waste', 'Plastic bottles collecting at the lower pool. Clean-up requested.', 'pending', 'ranger', 'Ranger · Nongriat', '35 minutes'),
  ('nongriat', 'crowd', 'Felt crowded near the natural pool around noon.', 'unverified', 'traveller', 'Traveller report', '1 hour'),
  ('nohkalikai', 'road', 'Small slip cleared to one lane, about 4 km before Sohra. Traffic moving slowly.', 'verified', 'ranger', 'Ranger · Sohra', '3 hours'),
  ('nohkalikai', 'weather', 'Dense fog likely in the morning over higher reaches.', 'official', 'official', 'IMD · East Khasi Hills', '4 hours'),
  ('nohkalikai', 'waste', 'Waste bins full at the viewpoint car park. Please carry your waste back.', 'verified', 'ranger', 'Ranger · Sohra', '5 hours'),
  ('dawki', 'trail', 'Boating running normally from Shnongpdeng. Water very clear.', 'verified', 'ranger', 'Ranger · Shnongpdeng', '1 hour'),
  ('dawki', 'crowd', 'Long boat queues reported at the Dawki stand after 11 am.', 'pending', 'ranger', 'Ranger · Dawki', '20 minutes'),
  ('dawki', 'weather', 'Dry weather expected through the weekend.', 'official', 'official', 'IMD · West Jaintia Hills', '4 hours'),
  ('dzukou', 'waste', 'Litter left near the rest house after the weekend. Village volunteers clearing it.', 'verified', 'ranger', 'Ranger · Viswema', '1 day'),
  ('tsomgo', 'road', 'Snow clearing in progress beyond 15th Mile. Permits issued for the morning slot only.', 'official', 'official', 'Sikkim Tourism (sample)', '6 hours')
) as r(slug, category, body, status, source, label, ago)
join public.destinations d on d.slug = r.slug;

insert into public.heritage_sites
  (destination_id, state_code, name, site_type, community, description, protection, lat, lng, photography, restricted, guidelines, is_published)
select (select id from public.destinations where slug = h.dest), h.state, h.name, h.kind, h.community, h.descr, h.protection,
  h.lat, h.lng, h.photo, h.restricted, h.guidelines, true
from (values
  (null, 'ML', 'Mawphlang Sacred Grove', 'Sacred grove', 'Khasi', 'Community-protected forest where nothing may be removed.', 'Community sacred', 25.4450, 91.7510, 'ask', false,
    array['Nothing may be taken out of the forest', 'Go with a local guide', 'Stay on the path']),
  (null, 'ML', 'Nartiang Monoliths', 'Monolith site', 'Jaintia (Pnar)', 'Large cluster of standing and table stones linked to the Jaintia kingdom.', 'State protected', 25.5770, 92.2140, 'allowed', false,
    array['Don''t climb on the stones']),
  ('nongriat', 'ML', 'Umshiang Double-Decker Bridge', 'Living root bridge', 'Khasi', 'Bridge trained from Ficus elastica roots over generations.', 'Community maintained', 25.2486, 91.6730, 'allowed', false,
    array['Stay off the roots', 'Don''t carve or tie anything to the roots']),
  ('majuli', 'AS', 'Auniati Satra', 'Satra (monastery)', 'Assamese Vaishnavite', 'Satra known for its museum and devotional performing arts.', 'Religious institution', 26.9700, 94.2000, 'ask', false,
    array['Dress modestly', 'Remove footwear in the namghar']),
  ('ziro', 'AR', 'Hong Village', 'Traditional village', 'Apatani', 'Large Apatani village with traditional granaries and bamboo houses.', 'Unlisted', 27.5600, 93.8400, 'ask', false,
    array['Ask before entering homes or granaries']),
  ('tawang', 'AR', 'Tawang Gompa', 'Monastery', 'Monpa', 'Seventeenth-century Gelug monastery.', 'Religious institution', 27.5859, 91.8594, 'ask', false,
    array['Walk clockwise', 'No photography inside prayer halls']),
  ('khonoma', 'NL', 'Khonoma Morung', 'Village dormitory', 'Angami', 'Traditional morung and memorial stones in the village.', 'Community', 25.6530, 94.0240, 'ask', false,
    array['Visit with a village guide']),
  (null, 'MN', 'Kangla Fort', 'Fort and sacred site', 'Meitei', 'Historic seat of Manipur''s rulers with sacred sites inside.', 'State protected', 24.8080, 93.9420, 'allowed', true,
    array['Some shrines are closed to visitors']),
  ('unakoti', 'TR', 'Unakoti Shaivite Reliefs', 'Rock-cut reliefs', 'Pilgrimage site', 'Rock-cut images including the large Unakotiswara Kal Bhairava head.', 'ASI protected', 24.3167, 92.0667, 'allowed', false,
    array['Don''t touch the carvings']),
  (null, 'SK', 'Rumtek Monastery', 'Monastery', 'Sikkimese Buddhist', 'Large Kagyu monastery near Gangtok.', 'Religious institution', 27.2889, 88.5617, 'ask', true,
    array['Carry ID for the security check', 'No photography inside the main shrine'])
) as h(dest, state, name, kind, community, descr, protection, lat, lng, photo, restricted, guidelines);

insert into public.events
  (name, community, state_code, destination_id, starts_on, ends_on, description, visitor_impact, open_to_visitors, etiquette, is_published)
select e.name, e.community, e.state, (select id from public.destinations where slug = e.dest), e.s::date, e.e::date, e.descr,
  e.impact::public.sensitivity, e.open, e.etiquette, true
from (values
  ('Wangala (100 Drums)', 'Garo', 'ML', null, '2026-11-06', '2026-11-08', 'Post-harvest thanksgiving to Saljong, the sun god.', 'medium', true, array['Ask before photographing dancers']),
  ('Raas Leela', 'Assamese Vaishnavite', 'AS', 'majuli', '2026-11-23', '2026-11-26', 'Satra performances of the Krishna Leela. Majuli fills up; book early.', 'high', true, array['Dress modestly', 'Book stays early']),
  ('Sangai Festival', 'Manipur', 'MN', 'loktak', '2026-11-21', '2026-11-30', 'State tourism festival named after the endangered brow-antlered deer.', 'high', true, array[]::text[]),
  ('Hornbill Festival', 'Naga tribes', 'NL', null, '2026-12-01', '2026-12-10', 'Festival of festivals at Kisama heritage village. Kohima-area stays sell out.', 'high', true, array['Ask before photographing', 'Expect Dzükou and Khonoma to be busier']),
  ('Losar', 'Monpa', 'AR', 'tawang', '2027-02-07', '2027-02-09', 'Tibetan Buddhist new year (dates follow the lunar calendar).', 'medium', true, array['Monastery rituals may be closed to visitors']),
  ('Chapchar Kut', 'Mizo', 'MZ', null, '2027-03-05', '2027-03-05', 'Spring festival after jhum clearing.', 'medium', true, array[]::text[]),
  ('Bohag Bihu', 'Assamese', 'AS', null, '2027-04-14', '2027-04-16', 'Assamese new year and spring festival.', 'medium', true, array[]::text[]),
  ('Shad Suk Mynsiem', 'Khasi', 'ML', null, '2027-04-10', '2027-04-12', 'Khasi dance of thanksgiving in Shillong.', 'low', true, array['Watch from the edges; the dance ground is for dancers']),
  ('Behdienkhlam', 'Jaintia (Pnar)', 'ML', null, '2027-07-14', '2027-07-17', 'Jowai festival to chase away plague and pray for harvest.', 'medium', true, array['Some rituals are for community members only']),
  ('Ziro Festival of Music', 'Apatani hosts', 'AR', 'ziro', '2027-09-23', '2027-09-26', 'Outdoor music festival in the valley.', 'high', true, array['Carry out all waste', 'Use festival campsites only']),
  ('Ambubachi Mela', 'Assamese', 'AS', null, '2027-06-22', '2027-06-25', 'Kamakhya temple fair; Guwahati hotels fill up.', 'high', true, array[]::text[])
) as e(name, community, state, dest, s, e, descr, impact, open, etiquette);

alter table public.reports enable trigger reports_insert;
alter table public.heritage_sites enable trigger heritage_publish;
alter table public.events enable trigger events_publish;

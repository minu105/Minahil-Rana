export type Meme = {
  url: string;
  title: string;
  postLink?: string;
  author?: string;
  source: 'meme-api' | 'imgflip';
};

const DEV_SUBS = [
  'ProgrammerHumor',
  'programmingmemes',
  'ProgrammerHumorMemes',
  'compsci',
  'TechHumor',
];

function randomSub() {
  return DEV_SUBS[Math.floor(Math.random() * DEV_SUBS.length)];
}

async function fetchMemeApi(count: number): Promise<Meme[]> {
  const sub = randomSub(); 
  const res = await fetch(`https://meme-api.com/gimme/${sub}/${count}`, {
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({} as any));
  const arr = Array.isArray(json?.memes) ? json.memes : json ? [json] : [];
  return arr.map((m: any) => ({
    url: m.url,
    title: m.title,
    postLink: m.postLink,
    author: m.author,
    source: 'meme-api',
  }));
}

async function fetchImgflip(count: number): Promise<Meme[]> {
  const res = await fetch('https://api.imgflip.com/get_memes', {
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({} as any));
  const all = json?.data?.memes ?? [];
  const keywords =
    /code|program|debug|bug|developer|dev|java|python|javascript|linux|computer|stack|overflow|git|merge|commit|binary|server|api|frontend|backend/i;
  const filtered = all.filter((m: any) => keywords.test(m.name));
  const pool = filtered.length ? filtered : all;
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((m: any) => ({
    url: m.url,
    title: m.name,
    postLink: `https://imgflip.com/meme/${m.id}`,
    source: 'imgflip',
  }));
}

export async function getMixedMemes(count = 12): Promise<Meme[]> {
  const tasks = [
    fetchMemeApi(count).catch(() => [] as Meme[]),
    fetchImgflip(count).catch(() => [] as Meme[]),
  ];

  const batches = await Promise.all(tasks);
  const combined: Meme[] = [...batches[0], ...batches[1]];
  const seen = new Set<string>();
  const out: Meme[] = [];
  for (const m of combined) {
    const key = m.url || m.postLink || m.title;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(m);
    if (out.length >= count) break;
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

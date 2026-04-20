import crypto from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  profile_image: string | null;
  credits: number;
  is_admin: number;
  is_active: number;
  created_at: string;
}

export interface Style {
  id: number;
  user_id: number;
  image_url: string;
  analysis_json: string | null;
  likes_count: number;
  is_hidden: number;
  created_at: string;
}

export interface Like {
  id: number;
  user_id: number;
  style_id: number;
}

export interface Report {
  id: number;
  user_id: number;
  style_id: number;
  reason: string;
  status: string;
  created_at: string;
}

export interface Fitting {
  id: number;
  user_id: number;
  my_image: string | null;
  style_image: string | null;
  result_image: string | null;
  selected_items: string | null;
  created_at: string;
}

export interface CreditTransaction {
  id: number;
  user_id: number;
  amount: number;
  type: string;
  description: string | null;
  status: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// In-memory tables
// ---------------------------------------------------------------------------

const tables = {
  users: [] as User[],
  styles: [] as Style[],
  likes: [] as Like[],
  reports: [] as Report[],
  fittings: [] as Fitting[],
  credit_transactions: [] as CreditTransaction[],
};

const nextId = {
  users: 1,
  styles: 1,
  likes: 1,
  reports: 1,
  fittings: 1,
  credit_transactions: 1,
};

function now(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

let seeded = false;

function seedIfNeeded() {
  if (seeded) return;
  seeded = true;

  const hash = (pw: string) =>
    crypto.createHash("sha256").update(pw).digest("hex");

  // Demo users
  insertUser({ email: "demo@mildfist.com", password_hash: hash("demo1234"), name: "스타일리스트 민지", credits: 50, is_admin: 1, is_active: 1, profile_image: null });
  insertUser({ email: "fashion@mildfist.com", password_hash: hash("fashion1234"), name: "패션러버 서준", credits: 30, is_admin: 0, is_active: 1, profile_image: null });
  insertUser({ email: "test@mildfist.com", password_hash: hash("test1234"), name: "코디왕 하은", credits: 100, is_admin: 0, is_active: 1, profile_image: null });

  // Sample styles
  const sampleStyles = [
    {
      userId: 1,
      analysis: JSON.stringify({
        items: [
          { category: "상의", name: "베이지 오버사이즈 블레이저", color: "베이지", style: "미니멀", description: "클래식한 실루엣의 오버사이즈 블레이저" },
          { category: "하의", name: "와이드 슬랙스", color: "네이비", style: "비즈캐주얼", description: "깔끔한 핏의 와이드 슬랙스" },
          { category: "신발", name: "화이트 로퍼", color: "화이트", style: "클래식", description: "깔끔한 가죽 로퍼" },
        ],
      }),
      likes: 24,
    },
    {
      userId: 2,
      analysis: JSON.stringify({
        items: [
          { category: "상의", name: "블랙 크롭 자켓", color: "블랙", style: "스트릿", description: "트렌디한 크롭 기장의 자켓" },
          { category: "하의", name: "카고 팬츠", color: "올리브", style: "스트릿", description: "포켓 디테일의 카고 팬츠" },
          { category: "모자", name: "볼캡", color: "블랙", style: "캐주얼", description: "심플한 볼캡" },
        ],
      }),
      likes: 18,
    },
    {
      userId: 1,
      analysis: JSON.stringify({
        items: [
          { category: "상의", name: "스트라이프 니트", color: "네이비/화이트", style: "프레피", description: "보더 패턴의 니트 스웨터" },
          { category: "하의", name: "데님 스커트", color: "라이트블루", style: "캐주얼", description: "미디 기장의 A라인 데님 스커트" },
          { category: "가방", name: "캔버스 토트백", color: "에크루", style: "내추럴", description: "내추럴한 캔버스 소재 토트백" },
        ],
      }),
      likes: 31,
    },
    {
      userId: 3,
      analysis: JSON.stringify({
        items: [
          { category: "상의", name: "화이트 오버핏 셔츠", color: "화이트", style: "미니멀", description: "깔끔한 오버핏 코튼 셔츠" },
          { category: "하의", name: "블랙 스키니진", color: "블랙", style: "모던", description: "슬림핏 블랙 데님" },
          { category: "액세서리", name: "실버 체인 목걸이", color: "실버", style: "모던", description: "심플한 체인 목걸이" },
        ],
      }),
      likes: 42,
    },
    {
      userId: 2,
      analysis: JSON.stringify({
        items: [
          { category: "상의", name: "그레이 후드티", color: "그레이", style: "캐주얼", description: "편안한 오버사이즈 후드티" },
          { category: "하의", name: "조거 팬츠", color: "블랙", style: "스포티", description: "편안한 핏의 조거 팬츠" },
          { category: "신발", name: "뉴발란스 530", color: "화이트/실버", style: "스포티", description: "레트로 감성의 러닝화" },
        ],
      }),
      likes: 15,
    },
    {
      userId: 3,
      analysis: JSON.stringify({
        items: [
          { category: "상의", name: "가죽 바이커 자켓", color: "블랙", style: "록시크", description: "클래식한 바이커 스타일 가죽 자켓" },
          { category: "하의", name: "플레어 팬츠", color: "블랙", style: "빈티지", description: "70년대 감성의 플레어 실루엣" },
          { category: "가방", name: "미니 체인백", color: "블랙", style: "록시크", description: "체인 스트랩의 미니 숄더백" },
          { category: "신발", name: "첼시 부츠", color: "블랙", style: "록시크", description: "클래식 첼시 부츠" },
        ],
      }),
      likes: 56,
    },
  ];

  const colors = ["#e8d5c4", "#c4d4e8", "#d4e8c4", "#e8c4d4", "#c4e8d8", "#d8c4e8"];
  const labels = ["Minimal Blazer", "Street Cargo", "Preppy Knit", "Modern Shirt", "Casual Hood", "Rock Chic"];

  sampleStyles.forEach((s, i) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <rect width="400" height="560" fill="${colors[i]}"/>
      <text x="200" y="240" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#211922" opacity="0.6">${labels[i]}</text>
      <text x="200" y="280" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#62625b" opacity="0.5">Style #${i + 1}</text>
      <circle cx="200" cy="180" r="40" fill="none" stroke="#211922" stroke-width="1.5" opacity="0.2"/>
      <line x1="200" y1="220" x2="200" y2="340" stroke="#211922" stroke-width="1.5" opacity="0.2"/>
      <line x1="200" y1="260" x2="160" y2="300" stroke="#211922" stroke-width="1.5" opacity="0.2"/>
      <line x1="200" y1="260" x2="240" y2="300" stroke="#211922" stroke-width="1.5" opacity="0.2"/>
      <line x1="200" y1="340" x2="170" y2="400" stroke="#211922" stroke-width="1.5" opacity="0.2"/>
      <line x1="200" y1="340" x2="230" y2="400" stroke="#211922" stroke-width="1.5" opacity="0.2"/>
    </svg>`;
    const b64 = Buffer.from(svg).toString("base64");
    const dataUrl = `data:image/svg+xml;base64,${b64}`;
    insertStyle({ user_id: s.userId, image_url: dataUrl, analysis_json: s.analysis, likes_count: s.likes });
  });
}

// ---------------------------------------------------------------------------
// Internal helpers (direct table manipulation)
// ---------------------------------------------------------------------------

function insertUser(data: Omit<User, "id" | "created_at">): User {
  const user: User = { id: nextId.users++, created_at: now(), ...data };
  tables.users.push(user);
  return user;
}

function insertStyle(data: { user_id: number; image_url: string; analysis_json: string | null; likes_count?: number }): Style {
  const style: Style = {
    id: nextId.styles++,
    user_id: data.user_id,
    image_url: data.image_url,
    analysis_json: data.analysis_json,
    likes_count: data.likes_count ?? 0,
    is_hidden: 0,
    created_at: now(),
  };
  tables.styles.push(style);
  return style;
}

// ---------------------------------------------------------------------------
// Public DB interface — mimics better-sqlite3 prepare().get/all/run
// ---------------------------------------------------------------------------

type RunResult = { changes: number; lastInsertRowid: number };

interface Statement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): RunResult;
}

interface Db {
  prepare(sql: string): Statement;
}

/**
 * Returns an in-memory DB instance that mirrors the better-sqlite3 API
 * used throughout the codebase: db.prepare(sql).get/all/run(...params)
 *
 * The SQL strings are pattern-matched (not fully parsed) — this covers every
 * query used in the existing API routes.
 */
export function getDb(): Db {
  seedIfNeeded();

  return {
    prepare(sql: string): Statement {
      return {
        get(...params: unknown[]): unknown {
          return execGet(sql, params);
        },
        all(...params: unknown[]): unknown[] {
          return execAll(sql, params);
        },
        run(...params: unknown[]): RunResult {
          return execRun(sql, params);
        },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// SQL pattern matcher — covers every query in the codebase
// ---------------------------------------------------------------------------

function p(i: number, params: unknown[]): unknown {
  return params[i];
}

function dateStr(d: string): string {
  return d.slice(0, 10);
}

function monthStr(d: string): string {
  return d.slice(0, 7);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function execGet(sql: string, params: unknown[]): any {
  const s = sql.replace(/\s+/g, " ").trim();

  // SELECT COUNT(*) as count FROM users
  if (/SELECT COUNT\(\*\) as count FROM users/i.test(s) && !s.includes("WHERE")) {
    // admin/members with search
    if (s.includes("LIKE")) {
      const pattern = String(p(0, params)).replace(/%/g, "");
      const count = tables.users.filter(u => u.name.includes(pattern) || u.email.includes(pattern)).length;
      return { count };
    }
    return { count: tables.users.length };
  }

  // SELECT COUNT(*) as count FROM styles WHERE is_hidden = 0
  if (/SELECT COUNT\(\*\) as count FROM styles WHERE is_hidden = 0/i.test(s)) {
    return { count: tables.styles.filter(st => st.is_hidden === 0).length };
  }

  // SELECT COUNT(*) as count FROM styles (all)
  if (/SELECT COUNT\(\*\) as count FROM styles/i.test(s) && !s.includes("is_hidden")) {
    return { count: tables.styles.length };
  }

  // SELECT COUNT(*) as count FROM reports WHERE status = 'pending'
  if (/SELECT COUNT\(\*\) as count FROM reports WHERE status = 'pending'/i.test(s)) {
    return { count: tables.reports.filter(r => r.status === "pending").length };
  }

  // SELECT COUNT(*) as count FROM credit_transactions WHERE type = 'charge'
  if (/SELECT COUNT\(\*\) as count FROM credit_transactions WHERE type = 'charge'/i.test(s) && !s.includes("refund")) {
    return { count: tables.credit_transactions.filter(ct => ct.type === "charge").length };
  }

  // SELECT COUNT(*) as count FROM credit_transactions WHERE type IN ('charge', 'refund')
  if (/SELECT COUNT\(\*\) as count FROM credit_transactions WHERE type IN \('charge', 'refund'\)/i.test(s)) {
    return { count: tables.credit_transactions.filter(ct => ct.type === "charge" || ct.type === "refund").length };
  }

  // SELECT COUNT(*) as count FROM fittings
  if (/SELECT COUNT\(\*\) as count FROM fittings/i.test(s)) {
    return { count: tables.fittings.length };
  }

  // SELECT * FROM users WHERE email = ?
  if (/SELECT \* FROM users WHERE email/i.test(s)) {
    return tables.users.find(u => u.email === String(p(0, params))) ?? undefined;
  }

  // SELECT id FROM users WHERE email = ?
  if (/SELECT id FROM users WHERE email/i.test(s)) {
    const u = tables.users.find(u => u.email === String(p(0, params)));
    return u ? { id: u.id } : undefined;
  }

  // SELECT id, email, name, profile_image, credits, created_at FROM users WHERE id = ?
  if (/SELECT id, email, name, profile_image, credits, created_at FROM users WHERE id/i.test(s)) {
    const u = tables.users.find(u => u.id === Number(p(0, params)));
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, profile_image: u.profile_image, credits: u.credits, created_at: u.created_at };
  }

  // SELECT id, email, name, profile_image, credits, is_admin, is_active, created_at FROM users WHERE id = ?
  if (/SELECT id, email, name, profile_image, credits, is_admin, is_active, created_at FROM users WHERE id/i.test(s)) {
    const u = tables.users.find(u => u.id === Number(p(0, params)));
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, profile_image: u.profile_image, credits: u.credits, is_admin: u.is_admin, is_active: u.is_active, created_at: u.created_at };
  }

  // SELECT id, email, name, credits, is_active, is_admin, created_at FROM users WHERE id = ?
  if (/SELECT id, email, name, credits, is_active, is_admin, created_at FROM users WHERE id/i.test(s)) {
    const u = tables.users.find(u => u.id === Number(p(0, params)));
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, credits: u.credits, is_active: u.is_active, is_admin: u.is_admin, created_at: u.created_at };
  }

  // SELECT credits FROM users WHERE id = ?
  if (/SELECT credits FROM users WHERE id/i.test(s)) {
    const u = tables.users.find(u => u.id === Number(p(0, params)));
    return u ? { credits: u.credits } : undefined;
  }

  // SELECT id, name, credits FROM users WHERE id = ?
  if (/SELECT id, name, credits FROM users WHERE id/i.test(s)) {
    const u = tables.users.find(u => u.id === Number(p(0, params)));
    if (!u) return undefined;
    return { id: u.id, name: u.name, credits: u.credits };
  }

  // SELECT id, email, name, profile_image, credits, is_active, is_admin, created_at FROM users WHERE id = ?
  if (/SELECT id, email, name, profile_image, credits, is_active, is_admin, created_at FROM users WHERE id/i.test(s)) {
    const u = tables.users.find(u => u.id === Number(p(0, params)));
    if (!u) return undefined;
    return { id: u.id, email: u.email, name: u.name, profile_image: u.profile_image, credits: u.credits, is_active: u.is_active, is_admin: u.is_admin, created_at: u.created_at };
  }

  // Style with user JOIN — SELECT s.*, u.name ... WHERE s.id = ?
  if (/FROM styles s.*JOIN users u.*WHERE s\.id/i.test(s)) {
    const id = Number(p(0, params));
    const st = tables.styles.find(st => st.id === id);
    if (!st) return undefined;
    const u = tables.users.find(u => u.id === st.user_id);
    return { ...st, user_name: u?.name ?? "", user_profile: u?.profile_image ?? null };
  }

  // SELECT id FROM styles WHERE id = ?
  if (/SELECT id FROM styles WHERE id/i.test(s)) {
    const st = tables.styles.find(st => st.id === Number(p(0, params)));
    return st ? { id: st.id } : undefined;
  }

  // SELECT likes_count FROM styles WHERE id = ?
  if (/SELECT likes_count FROM styles WHERE id/i.test(s)) {
    const st = tables.styles.find(st => st.id === Number(p(0, params)));
    return st ? { likes_count: st.likes_count } : undefined;
  }

  // SELECT id FROM likes WHERE user_id = ? AND style_id = ?
  if (/SELECT id FROM likes WHERE user_id/i.test(s)) {
    const like = tables.likes.find(l => l.user_id === Number(p(0, params)) && l.style_id === Number(p(1, params)));
    return like ? { id: like.id } : undefined;
  }

  // SELECT style_id FROM reports WHERE id = ?
  if (/SELECT style_id FROM reports WHERE id/i.test(s)) {
    const r = tables.reports.find(r => r.id === Number(p(0, params)));
    return r ? { style_id: r.style_id } : undefined;
  }

  // SELECT id, user_id, amount, type, status FROM credit_transactions WHERE id = ?
  if (/SELECT id, user_id, amount, type, status FROM credit_transactions WHERE id/i.test(s)) {
    const ct = tables.credit_transactions.find(ct => ct.id === Number(p(0, params)));
    if (!ct) return undefined;
    return { id: ct.id, user_id: ct.user_id, amount: ct.amount, type: ct.type, status: ct.status };
  }

  // Admin stats: todayActive
  if (/SELECT COUNT\(DISTINCT user_id\) as count FROM/i.test(s)) {
    const today = todayStr();
    const userIds = new Set<number>();
    tables.styles.filter(st => dateStr(st.created_at) === today).forEach(st => userIds.add(st.user_id));
    tables.fittings.filter(f => dateStr(f.created_at) === today).forEach(f => userIds.add(f.user_id));
    return { count: userIds.size };
  }

  // Admin stats: charge stats
  if (/SELECT COUNT\(\*\) as count, COALESCE\(SUM\(amount\), 0\) as total/i.test(s)) {
    const charges = tables.credit_transactions.filter(ct => ct.type === "charge" && ct.status === "completed");
    return { count: charges.length, total: charges.reduce((sum, ct) => sum + ct.amount, 0) };
  }

  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function execAll(sql: string, params: unknown[]): any[] {
  const s = sql.replace(/\s+/g, " ").trim();

  // Styles list with JOIN — SELECT s.id, s.user_id ... FROM styles s JOIN users u ... WHERE s.is_hidden = 0 ORDER BY ... LIMIT ? OFFSET ?
  if (/FROM styles s.*JOIN users u.*WHERE s\.is_hidden = 0/i.test(s)) {
    let items = tables.styles
      .filter(st => st.is_hidden === 0)
      .map(st => {
        const u = tables.users.find(u => u.id === st.user_id);
        return { ...st, user_name: u?.name ?? "", user_profile: u?.profile_image ?? null };
      });

    if (s.includes("likes_count DESC")) {
      items.sort((a, b) => b.likes_count - a.likes_count);
    } else {
      items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    const limit = Number(p(0, params));
    const offset = Number(p(1, params));
    return items.slice(offset, offset + limit);
  }

  // Fittings: SELECT * FROM fittings WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  if (/FROM fittings WHERE user_id/i.test(s)) {
    return tables.fittings
      .filter(f => f.user_id === Number(p(0, params)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 50);
  }

  // Credit transactions: SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  if (/FROM credit_transactions WHERE user_id = \?/i.test(s) && !s.includes("type")) {
    return tables.credit_transactions
      .filter(ct => ct.user_id === Number(p(0, params)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 50);
  }

  // Admin members list
  if (/FROM users u.*ORDER BY u\.created_at DESC.*LIMIT/i.test(s)) {
    let users = [...tables.users];
    if (s.includes("LIKE")) {
      const pattern = String(p(0, params)).replace(/%/g, "");
      users = users.filter(u => u.name.includes(pattern) || u.email.includes(pattern));
      const limit = Number(p(2, params));
      const offset = Number(p(3, params));
      return users.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(offset, offset + limit).map(u => ({
        ...u,
        style_count: tables.styles.filter(st => st.user_id === u.id).length,
        fitting_count: tables.fittings.filter(f => f.user_id === u.id).length,
      }));
    }
    const limit = Number(p(0, params));
    const offset = Number(p(1, params));
    return users.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(offset, offset + limit).map(u => ({
      ...u,
      style_count: tables.styles.filter(st => st.user_id === u.id).length,
      fitting_count: tables.fittings.filter(f => f.user_id === u.id).length,
    }));
  }

  // Admin member styles
  if (/SELECT id, image_url, likes_count, is_hidden, created_at FROM styles WHERE user_id/i.test(s)) {
    return tables.styles
      .filter(st => st.user_id === Number(p(0, params)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(st => ({ id: st.id, image_url: st.image_url, likes_count: st.likes_count, is_hidden: st.is_hidden, created_at: st.created_at }));
  }

  // Admin member fittings
  if (/SELECT id, result_image, selected_items, created_at FROM fittings WHERE user_id/i.test(s)) {
    return tables.fittings
      .filter(f => f.user_id === Number(p(0, params)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10)
      .map(f => ({ id: f.id, result_image: f.result_image, selected_items: f.selected_items, created_at: f.created_at }));
  }

  // Admin member credit history
  if (/SELECT id, amount, type, description, status, created_at FROM credit_transactions WHERE user_id/i.test(s)) {
    return tables.credit_transactions
      .filter(ct => ct.user_id === Number(p(0, params)))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 20)
      .map(ct => ({ id: ct.id, amount: ct.amount, type: ct.type, description: ct.description, status: ct.status, created_at: ct.created_at }));
  }

  // Admin reports list
  if (/FROM reports r.*JOIN users u.*JOIN styles s.*JOIN users su/i.test(s)) {
    const limit = Number(p(0, params));
    const offset = Number(p(1, params));
    return tables.reports
      .filter(r => r.status === "pending")
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(offset, offset + limit)
      .map(r => {
        const reporter = tables.users.find(u => u.id === r.user_id);
        const style = tables.styles.find(st => st.id === r.style_id);
        const owner = style ? tables.users.find(u => u.id === style.user_id) : undefined;
        return {
          id: r.id,
          reason: r.reason,
          status: r.status,
          created_at: r.created_at,
          style_id: r.style_id,
          reporter_name: reporter?.name ?? "",
          reporter_email: reporter?.email ?? "",
          style_image: style?.image_url ?? "",
          style_hidden: style?.is_hidden ?? 0,
          style_owner_name: owner?.name ?? "",
        };
      });
  }

  // Admin contents list (all styles)
  if (/FROM styles s.*JOIN users u ON s\.user_id.*ORDER BY s\.created_at DESC.*LIMIT/i.test(s)) {
    const limit = Number(p(0, params));
    const offset = Number(p(1, params));
    return tables.styles
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(offset, offset + limit)
      .map(st => {
        const u = tables.users.find(u => u.id === st.user_id);
        return {
          id: st.id,
          image_url: st.image_url,
          likes_count: st.likes_count,
          is_hidden: st.is_hidden,
          created_at: st.created_at,
          user_name: u?.name ?? "",
          user_email: u?.email ?? "",
        };
      });
  }

  // Admin credits/transactions (charge only)
  if (/FROM credit_transactions ct.*JOIN users u.*WHERE ct\.type = 'charge'/i.test(s)) {
    const limit = Number(p(0, params));
    const offset = Number(p(1, params));
    return tables.credit_transactions
      .filter(ct => ct.type === "charge")
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(offset, offset + limit)
      .map(ct => {
        const u = tables.users.find(u => u.id === ct.user_id);
        return {
          id: ct.id,
          amount: ct.amount,
          type: ct.type,
          description: ct.description,
          status: ct.status,
          created_at: ct.created_at,
          user_name: u?.name ?? "",
          user_email: u?.email ?? "",
        };
      });
  }

  // Admin payments/transactions (charge or refund)
  if (/FROM credit_transactions ct.*JOIN users u.*WHERE ct\.type IN \('charge', 'refund'\)/i.test(s)) {
    const limit = Number(p(0, params));
    const offset = Number(p(1, params));
    return tables.credit_transactions
      .filter(ct => ct.type === "charge" || ct.type === "refund")
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(offset, offset + limit)
      .map(ct => {
        const u = tables.users.find(u => u.id === ct.user_id);
        return {
          id: ct.id,
          amount: ct.amount,
          type: ct.type,
          description: ct.description,
          status: ct.status,
          created_at: ct.created_at,
          user_name: u?.name ?? "",
          user_email: u?.email ?? "",
        };
      });
  }

  // Admin stats: daily stats (last 7 days)
  if (/date\(created_at\) as day/i.test(s)) {
    const cutoff = daysAgo(7);
    const charges = tables.credit_transactions.filter(
      ct => ct.type === "charge" && ct.status === "completed" && ct.created_at >= cutoff
    );
    const grouped = new Map<string, { count: number; total: number }>();
    for (const ct of charges) {
      const day = dateStr(ct.created_at);
      const g = grouped.get(day) ?? { count: 0, total: 0 };
      g.count++;
      g.total += ct.amount;
      grouped.set(day, g);
    }
    return Array.from(grouped.entries())
      .map(([day, g]) => ({ day, count: g.count, total: g.total }))
      .sort((a, b) => b.day.localeCompare(a.day));
  }

  // Admin stats: monthly stats (last 3 months)
  if (/strftime\('%Y-%m', created_at\) as month/i.test(s)) {
    const cutoff = monthsAgo(3);
    const charges = tables.credit_transactions.filter(
      ct => ct.type === "charge" && ct.status === "completed" && ct.created_at >= cutoff
    );
    const grouped = new Map<string, { count: number; total: number }>();
    for (const ct of charges) {
      const month = monthStr(ct.created_at);
      const g = grouped.get(month) ?? { count: 0, total: 0 };
      g.count++;
      g.total += ct.amount;
      grouped.set(month, g);
    }
    return Array.from(grouped.entries())
      .map(([month, g]) => ({ month, count: g.count, total: g.total }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  // Admin stats: recent activity (UNION ALL)
  if (/event_type.*signup.*style.*fitting.*charge/i.test(s)) {
    type Activity = { event_type: string; user_name: string; detail: string; created_at: string };
    const events: Activity[] = [];

    tables.users.forEach(u => {
      events.push({ event_type: "signup", user_name: u.name, detail: u.email, created_at: u.created_at });
    });
    tables.styles.forEach(st => {
      const u = tables.users.find(u => u.id === st.user_id);
      events.push({ event_type: "style", user_name: u?.name ?? "", detail: "스타일 업로드", created_at: st.created_at });
    });
    tables.fittings.forEach(f => {
      const u = tables.users.find(u => u.id === f.user_id);
      events.push({ event_type: "fitting", user_name: u?.name ?? "", detail: "가상 피팅", created_at: f.created_at });
    });
    tables.credit_transactions.filter(ct => ct.type === "charge").forEach(ct => {
      const u = tables.users.find(u => u.id === ct.user_id);
      events.push({ event_type: "charge", user_name: u?.name ?? "", detail: ct.description ?? "", created_at: ct.created_at });
    });

    return events.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  }

  return [];
}

function execRun(sql: string, params: unknown[]): RunResult {
  const s = sql.replace(/\s+/g, " ").trim();

  // INSERT INTO users
  if (/INSERT INTO users/i.test(s)) {
    const user: User = {
      id: nextId.users++,
      email: String(p(0, params)),
      password_hash: String(p(1, params)),
      name: String(p(2, params)),
      credits: Number(p(3, params)),
      is_admin: params.length > 4 ? Number(p(4, params)) : 0,
      is_active: 1,
      profile_image: null,
      created_at: now(),
    };
    tables.users.push(user);
    return { changes: 1, lastInsertRowid: user.id };
  }

  // INSERT INTO styles
  if (/INSERT INTO styles/i.test(s)) {
    const style: Style = {
      id: nextId.styles++,
      user_id: Number(p(0, params)),
      image_url: String(p(1, params)),
      analysis_json: params[2] != null ? String(p(2, params)) : null,
      likes_count: params.length > 3 ? Number(p(3, params)) : 0,
      is_hidden: 0,
      created_at: now(),
    };
    tables.styles.push(style);
    return { changes: 1, lastInsertRowid: style.id };
  }

  // INSERT INTO likes
  if (/INSERT INTO likes/i.test(s)) {
    const like: Like = {
      id: nextId.likes++,
      user_id: Number(p(0, params)),
      style_id: Number(p(1, params)),
    };
    tables.likes.push(like);
    return { changes: 1, lastInsertRowid: like.id };
  }

  // INSERT INTO reports
  if (/INSERT INTO reports/i.test(s)) {
    const report: Report = {
      id: nextId.reports++,
      user_id: Number(p(0, params)),
      style_id: Number(p(1, params)),
      reason: String(p(2, params)),
      status: "pending",
      created_at: now(),
    };
    tables.reports.push(report);
    return { changes: 1, lastInsertRowid: report.id };
  }

  // INSERT INTO fittings
  if (/INSERT INTO fittings/i.test(s)) {
    const fitting: Fitting = {
      id: nextId.fittings++,
      user_id: Number(p(0, params)),
      my_image: params[1] != null ? String(p(1, params)) : null,
      style_image: params[2] != null ? String(p(2, params)) : null,
      result_image: params[3] != null ? String(p(3, params)) : null,
      selected_items: params[4] != null ? String(p(4, params)) : null,
      created_at: now(),
    };
    tables.fittings.push(fitting);
    return { changes: 1, lastInsertRowid: fitting.id };
  }

  // INSERT INTO credit_transactions (with explicit status)
  if (/INSERT INTO credit_transactions.*status\)/i.test(s)) {
    const ct: CreditTransaction = {
      id: nextId.credit_transactions++,
      user_id: Number(p(0, params)),
      amount: Number(p(1, params)),
      type: String(p(2, params)),
      description: params[3] != null ? String(p(3, params)) : null,
      status: String(p(4, params)),
      created_at: now(),
    };
    tables.credit_transactions.push(ct);
    return { changes: 1, lastInsertRowid: ct.id };
  }

  // INSERT INTO credit_transactions (without explicit status — default 'completed')
  if (/INSERT INTO credit_transactions/i.test(s)) {
    const ct: CreditTransaction = {
      id: nextId.credit_transactions++,
      user_id: Number(p(0, params)),
      amount: Number(p(1, params)),
      type: String(p(2, params)),
      description: params[3] != null ? String(p(3, params)) : null,
      status: "completed",
      created_at: now(),
    };
    tables.credit_transactions.push(ct);
    return { changes: 1, lastInsertRowid: ct.id };
  }

  // UPDATE users SET credits = credits + ? WHERE id = ?
  if (/UPDATE users SET credits = credits \+ \? WHERE id/i.test(s)) {
    const user = tables.users.find(u => u.id === Number(p(1, params)));
    if (user) user.credits += Number(p(0, params));
    return { changes: user ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE users SET credits = credits - ? WHERE id = ?
  if (/UPDATE users SET credits = credits - \? WHERE id/i.test(s)) {
    const user = tables.users.find(u => u.id === Number(p(1, params)));
    if (user) user.credits -= Number(p(0, params));
    return { changes: user ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE users SET is_active = ? WHERE id = ?
  if (/UPDATE users SET is_active/i.test(s)) {
    const user = tables.users.find(u => u.id === Number(p(1, params)));
    if (user) user.is_active = Number(p(0, params));
    return { changes: user ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE styles SET likes_count = MAX(0, likes_count - 1) WHERE id = ?
  if (/UPDATE styles SET likes_count = MAX\(0, likes_count - 1\)/i.test(s)) {
    const style = tables.styles.find(st => st.id === Number(p(0, params)));
    if (style) style.likes_count = Math.max(0, style.likes_count - 1);
    return { changes: style ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE styles SET likes_count = likes_count + 1 WHERE id = ?
  if (/UPDATE styles SET likes_count = likes_count \+ 1/i.test(s)) {
    const style = tables.styles.find(st => st.id === Number(p(0, params)));
    if (style) style.likes_count++;
    return { changes: style ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE styles SET is_hidden = 1 WHERE id = ?
  if (/UPDATE styles SET is_hidden = 1/i.test(s)) {
    const style = tables.styles.find(st => st.id === Number(p(0, params)));
    if (style) style.is_hidden = 1;
    return { changes: style ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE styles SET is_hidden = 0 WHERE id = ?
  if (/UPDATE styles SET is_hidden = 0/i.test(s)) {
    const style = tables.styles.find(st => st.id === Number(p(0, params)));
    if (style) style.is_hidden = 0;
    return { changes: style ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE reports SET status = ? WHERE id = ?
  if (/UPDATE reports SET status/i.test(s)) {
    const report = tables.reports.find(r => r.id === Number(p(1, params)));
    if (report) report.status = String(p(0, params));
    return { changes: report ? 1 : 0, lastInsertRowid: 0 };
  }

  // UPDATE credit_transactions SET status = ? WHERE id = ?
  if (/UPDATE credit_transactions SET status/i.test(s)) {
    const ct = tables.credit_transactions.find(ct => ct.id === Number(p(1, params)));
    if (ct) ct.status = String(p(0, params));
    return { changes: ct ? 1 : 0, lastInsertRowid: 0 };
  }

  // DELETE FROM users WHERE id = ?
  if (/DELETE FROM users WHERE id/i.test(s)) {
    const idx = tables.users.findIndex(u => u.id === Number(p(0, params)));
    if (idx >= 0) {
      const userId = tables.users[idx].id;
      tables.users.splice(idx, 1);
      // Cascade deletes
      tables.styles = tables.styles.filter(st => st.user_id !== userId);
      tables.likes = tables.likes.filter(l => l.user_id !== userId);
      tables.reports = tables.reports.filter(r => r.user_id !== userId);
      tables.fittings = tables.fittings.filter(f => f.user_id !== userId);
      tables.credit_transactions = tables.credit_transactions.filter(ct => ct.user_id !== userId);
      return { changes: 1, lastInsertRowid: 0 };
    }
    return { changes: 0, lastInsertRowid: 0 };
  }

  // DELETE FROM likes WHERE user_id = ? AND style_id = ?
  if (/DELETE FROM likes WHERE user_id/i.test(s)) {
    const idx = tables.likes.findIndex(l => l.user_id === Number(p(0, params)) && l.style_id === Number(p(1, params)));
    if (idx >= 0) {
      tables.likes.splice(idx, 1);
      return { changes: 1, lastInsertRowid: 0 };
    }
    return { changes: 0, lastInsertRowid: 0 };
  }

  // DELETE FROM styles WHERE id = ?
  if (/DELETE FROM styles WHERE id/i.test(s)) {
    const idx = tables.styles.findIndex(st => st.id === Number(p(0, params)));
    if (idx >= 0) {
      const styleId = tables.styles[idx].id;
      tables.styles.splice(idx, 1);
      // Cascade: remove likes and reports for this style
      tables.likes = tables.likes.filter(l => l.style_id !== styleId);
      tables.reports = tables.reports.filter(r => r.style_id !== styleId);
      return { changes: 1, lastInsertRowid: 0 };
    }
    return { changes: 0, lastInsertRowid: 0 };
  }

  console.warn("[in-memory-db] Unhandled SQL run:", s);
  return { changes: 0, lastInsertRowid: 0 };
}

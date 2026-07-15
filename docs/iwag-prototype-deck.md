# Intelligent Workflow Automation Agent — Prototype Deck

Slide 1 — Judul

- Intelligent Workflow Automation Agent (IWAG)
- Prototype Deck

Speaker notes:
Perkenalan singkat proyek: platform automation workflow visual dengan langkah AI, multi-trigger, dan execution realtime.

---

Slide 2 — Masalah

- Tim engineering dan operasional menghabiskan waktu manual untuk mengotomasi proses berulang
- Integrasi AI ke workflow tersulit dan membutuhkan orchestration yang aman
- Observability dan audit trail sering tertinggal

Speaker notes:
Jelaskan painpoint: biaya waktu, risiko human error, kebutuhan automasi end-to-end.

---

Slide 3 — Solusi (IWAG)

- Visual editor drag & drop untuk membangun workflow
- Node types: AI Step, HTTP Request, Code, Condition, Delay, Email, dsb.
- Multi-trigger: manual, cron, webhook, event-based
- Real-time execution & audit logging

Speaker notes:
Tunjukkan bagaimana IWAG memudahkan pembuatan pipeline automasi, termasuk integrasi AI untuk pemrosesan teks/keputusan.

---

Slide 4 — Demo singkat

- Frontend live di: https://habiutomo.github.io/intelligent-workflow-automation-agent/
- Fitur yang disorot: drag & drop, menjalankan workflow, melihat run logs

Speaker notes:
Arahkan audience ke demo Github Pages; jelaskan langkah demo: buat workflow -> tambah AI step -> jalankan -> lihat logs.

---

Slide 5 — Arsitektur Teknis

- Frontend: React + Vite + React Flow + Tailwind
- Backend: Node.js + TypeScript + Express + Socket.IO
- DB: Prisma (SQLite) — bisa ganti ke Postgres
- Queue: BullMQ (opsional)
- Integrasi: OpenAI / Anthropic via API

Speaker notes:
Jelaskan data flow: user builds di UI -> simpan ke backend -> scheduler/trigger menjalankan -> executor men-stream status via websocket.

---

Slide 6 — Node Types & Capabilities

- AI Step: prompt + context + output mapping
- HTTP Request: auth, headers, mapping respons
- Code: run JS/Python sandboxed (security note)
- Condition & branching
- Parallel & merge
- Webhook & schedule

Speaker notes:
Berikan contoh kasus penggunaan tiap node, mis. AI Step untuk summarization atau classification.

---

Slide 7 — Keamanan & Governance

- Audit logging untuk setiap run
- Role-based access control (planning)
- Sandbox execution untuk code nodes
- Secrets management via env/secret store

Speaker notes:
Tekankan kebutuhan sandbox dan audit untuk production use.

---

Slide 8 — Roadmap

1. v0.1 — Visual editor, basic node types, run & logs (PROTOTYPE)
2. v0.2 — Schedules, webhooks, advanced AI integrations
3. v0.3 — Multi-tenant, RBAC, secret store
4. v1.0 — Scalability, orchestration, marketplace nodes

Speaker notes:
Prioritaskan reliability & observability; jelaskan trade-offs.

---

Slide 9 — Tim & Requirements

- Pengembang: Fullstack (React + Node)
- DevOps: deployment & scaling
- Security: sandboxing, secrets
- Budget: hosting for backend, ML API costs

Speaker notes:
Sebutkan resource yang diperlukan untuk melanjutkan ke MVP.

---

Slide 10 — Call to Action

- Coba demo: https://habiutomo.github.io/intelligent-workflow-automation-agent/
- Request: feedback, contributors, atau dukungan hosting/API credits

Speaker notes:
Ajak audiens untuk mencoba, beri link ke repo dan halaman demo.

# Open Voices Backend

**Open Voices Backend** is the core API and service layer powering the Open Voices commenting platform. Built with [Hono](https://hono.dev/) and [Bun](https://bun.sh/), it delivers a privacy-first, lightweight, and blazing-fast backend for modern web discussions.

---

## 🚀 Core Value Proposition

- **Open-source & Privacy-first:** No tracking, no ads, GDPR-compliant.
- **Lightweight & Fast:** Minimal dependencies, optimized for speed.
- **Easy Integration:** Drop-in script, React/Vue/etc. components, or REST API.
- **Essential Features:** Everything you need for commenting, nothing you don’t.
- **Customizable:** Theming, configuration, and extensibility.

---

## 🧩 Core Features

- **RESTful API** for comment management (CRUD, threads, replies)
- **Authentication:** Anonymous (nickname + CAPTCHA) & OAuth (GitHub, Google, Twitter, etc.)
- **Threaded/Nested Comments** per resource/page
- **Markdown & Rich Text** (secure, XSS-safe)
- **Moderation:** Flag, report, hide, delete
- **Anti-spam:** Rate limiting, CAPTCHA
- **Search & Filter:** By date, popularity, author
- **Upvotes/Downvotes/Likes**
- **JWT-based Auth & Session Management**
- **Database:** Postgres
- **API Rate Limiting, Validation, and Sanitization**
- **Privacy:** No invasive cookies, full data ownership

---

## 🏗️ Tech Stack

- **Backend:** [Hono](https://hono.dev/) (TypeScript), running on [Bun](https://bun.sh/)
- **Database:** Prisma ORM + PostgreSQL
- **Auth:** JWT, OAuth 2.0 (GitHub, Google, Twitter/X, etc.)
- **API:** RESTful
- **Hosting:** Railway, Render, or any Bun or docker-compatible platform

---

## ⚡ Quick Start

1. **Clone & Install**

   ```bash
   git clone https://github.com/open-voices/open-voices.git
   cd open-voices-backend
   bun install
   ```

2. **Configure**

   Copy `.env.example` to `.env` and set your database/auth/secrets.

3. **Run**

   ```bash
   bun run dev
   ```

4. **API Usage**

   The backend exposes a REST API for all comment operations. See [API Docs](docs/API.md) for endpoints and usage.

---

## 🔒 Privacy & Security

- No tracking, no ads, no third-party analytics
- GDPR-compliant by design
- Secure authentication and session management
- XSS-safe markdown/rich text rendering

---

## 💼 SaaS & Premium Add-ons

- Advanced moderation dashboard (bulk actions, spam queue)
- Analytics (engagement metrics, sentiment analysis)
- SSO/Enterprise login
- Custom branding & whitelabel
- Webhooks & integrations (Slack, Discord, email)
- Priority support
- Federated comment hosting/CDN

---

## 🛠️ Pain Points Solved

- No bloat, no ads, no tracking (unlike Disqus and others)
- Privacy-first, GDPR-compliant
- Lightweight and fast, optimized for performance
- Full data ownership/control for site owners
- Seamless integration with any site or stack
- Open standards, easy migration
- Cost-effective

---

## 🌱 Roadmap & Future Features

- Rich media (images, gifs, video embeds)
- Inline emoji reactions
- Comment pinning/highlighting
- Community badges/leaderboards
- Automated moderation (AI/ML)
- Localization (i18n)
- Federation (ActivityPub/Mastodon)
- Import/export from Disqus and others

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

## 📝 License

Open Voices Backend is released under the [MIT License](../../LICENSE).

---

**Open Voices — Let your community be heard, on your terms.**
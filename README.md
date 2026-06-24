# MWVRC 2026 — Oral Presentation Assessment Portal

A small web app for the six Technical Session Chairs to score oral presenters
during the breakout sessions, with a live results/leaderboard and everything
recorded to your Google Sheet.

**⏱ Conference is tomorrow — here's the fastest path to get this live.**

---

## 1. Backend (Google Sheet + Apps Script) — do this first

1. Open the Google Sheet that's bound to your existing Apps Script deployment
   (the one behind `…/exec`).
2. **Extensions → Apps Script.** Delete everything in `Code.gs` and paste in
   the contents of `apps-script/Code.gs` from this project. Save.
3. In the function dropdown at the top of the editor, select **`setup`** and
   click **Run**. The first time, it'll ask you to authorize — allow it.
   This creates three tabs in your Sheet: `Chairs`, `Presenters`, `Assessments`,
   and seeds the 6 chairs already assigned to their rooms.
4. Open the **`Presenters`** tab in the Sheet and replace the sample row with
   your real presenters — one row each: `PresenterName | Room (A/B/C) | Theme`.
   This is the **only manual data entry** you need to do before the conference.
5. **Deploy → Manage deployments →** click the pencil (✎) on your existing
   deployment → **Version: New version → Deploy.**
   This pushes the new code live at your *existing* `/exec` URL — you do
   **not** need to change the URL anywhere in the frontend.

That's it for the backend. Test it by opening this in a browser:
`YOUR_EXEC_URL?action=getChairs` — you should see the 6 chairs as JSON.

## 2. Frontend

The `js/config.js` file already has your exec URL wired in:
```
API_URL: "https://script.google.com/macros/s/AKfycbyKZwHrvjiZk2nKxMbd8fYAnnkp0YpWcEarRkT2gFEhVKSzeYRw4366vZ6e-j8V07rDPg/exec"
```
If you ever create a *new* deployment (different URL), update it here.

### Add the chair photos
Drop the six JPEGs into `assets/chairs/` using **exactly** these filenames
(already matched to your list):
```
Dr. Efiba Vidda.jpeg
Dr. Emmanuel Arthur.jpeg
Dr. Emmanuela Kwao Boateng.jpeg
Dr. Henry Agbe.jpeg
Dr. Miriam Brempong.jpeg
Dr. Mrs. Mizpah Ama Dziedzorm.jpeg
```
If a photo is missing, the app automatically falls back to a clean initials
avatar — nothing breaks if you're still gathering photos.

### Deploy the frontend
Push this whole folder to GitHub, then enable **GitHub Pages** (Settings →
Pages → deploy from the `main` branch, root folder). That gives you a public
URL you can share with the six chairs. Any static host works too (Vercel,
Netlify, etc.) — it's plain HTML/CSS/JS, no build step.

## 3. How it works for a chair

1. **Sign in** — tap your name/photo on the landing screen.
2. **First time:** no PIN exists yet → you're asked to create a 4-digit PIN.
   **After that:** you just enter your existing PIN.
3. You land in **your assigned room only** — you can't see or score other
   rooms.
4. Tap a presenter → rate the four criteria (1–5 each). These are the
   conference's own **Best Oral Presentation** award criteria. A running
   total/"core sample" bar updates live.
5. Ratings save automatically as you tap — switching to the Results tab or
   closing the browser never loses progress. Nothing counts toward the
   leaderboard until you press **Submit assessment**.
6. You can reopen a submitted presenter and change scores any time — pressing
   the button again (now labeled "Update submission") overwrites the record.
7. **Results tab** — ranked leaderboard across all three rooms, filterable
   by room, medals for the top 3. Only *submitted* assessments count, and a
   presenter's score is the average of their assessors' totals.

## 4. Data model (in the Sheet)

- **Chairs** — `Name | Room | PIN | PinSet` (seeded for you)
- **Presenters** — `PresenterName | Room | Theme` (**you fill this in**)
- **Assessments** — one row per (chair, presenter): the four criterion
  scores, total, status (`Draft`/`Submitted`), and a timestamp. This is your
  full audit trail / Excel-style record.

## Notes & assumptions made

- **Rubric:** since none was specified, I used the conference's own published
  "Best Oral Presentation" award criteria (quality of findings, delivery,
  Q&A engagement, contribution to theme), each 1–5. Edit `CONFIG.CRITERIA` in
  `js/config.js` and the matching columns in the Sheet/`Code.gs` if you'd
  rather use different criteria.
- **PINs are 4 digits and unencrypted in the Sheet** — fine for a trusted,
  one-day internal tool among 6 known people; not meant as strong security.
- **Scoring:** a presenter's leaderboard score is the *average* of the totals
  given by each chair who has submitted (out of 20). If only one of two
  chairs has submitted, it ranks on that one score until the second comes in.

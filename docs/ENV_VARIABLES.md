# Al-Badr Bilasudi Co-Op Society - Vercel Environment Variables Guide

This document lists the exact environment variable names required for deploying the **Al-Badr Bilasudi Co-Op Society** PWA to Vercel (both Frontend Vite App and Serverless API functions).

---

## 1. Quick Summary Table

| Variable Name | Required For | Exposure | Purpose / Description | Example Value |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Frontend & Server | **Public** (`VITE_`) | Your Supabase Project REST URL | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Frontend & Server | **Public** (`VITE_`) | Supabase Anonymous Public Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (`/api/send-push`) | **Secret** (Server Only) | Supabase Secret Service Role Key (used for sending push notifications to all users) | `eyJhbGciOi...` |
| `VITE_VAPID_PUBLIC_KEY` | Frontend PWA | **Public** (`VITE_`) | Web Push VAPID Public Key for browser push subscription | `BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U` |
| `VAPID_PUBLIC_KEY` | Serverless Function | **Public / Server** | Same VAPID Public Key for `api/send-push` | `BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U` |
| `VAPID_PRIVATE_KEY` | Serverless Function | **Secret** (Server Only) | Secret VAPID Private Key used to cryptographically sign OS push notifications | `YOUR_GENERATED_VAPID_PRIVATE_KEY` |
| `VAPID_SUBJECT` | Serverless Function | **Server** | Admin contact email or URL for web push protocol | `mailto:admin@albadr-society.org` |

---

## 2. Where to Configure in Vercel

1. Open your project on **[Vercel Dashboard](https://vercel.com)**.
2. Go to **Settings** → **Environment Variables**.
3. Add each variable for **Production**, **Preview**, and **Development** environments.
4. Click **Save** and trigger a redeployment.

---

## 3. Detailed Instructions

### A. Supabase Credentials
1. Open your **Supabase Dashboard** (`https://supabase.com/dashboard/project/<your-project-ref>`).
2. Go to **Project Settings** → **API**.
3. Copy **Project URL** and paste as `VITE_SUPABASE_URL`.
4. Copy **anon / public** key and paste as `VITE_SUPABASE_ANON_KEY`.
5. Copy **service_role / secret** key and paste as `SUPABASE_SERVICE_ROLE_KEY` (Keep secret!).

### B. VAPID Keys for Web Push Notifications
If you need to generate a fresh pair of VAPID keys for your domain, you can run:
```bash
npx web-push generate-vapid-keys
```
This will print:
```
=======================================
Public Key:
<65-character base64 public key>

Private Key:
<43-character base64 private key>
=======================================
```
* Put the **Public Key** in `VITE_VAPID_PUBLIC_KEY` and `VAPID_PUBLIC_KEY`.
* Put the **Private Key** in `VAPID_PRIVATE_KEY`.
* Put `mailto:your-email@example.com` in `VAPID_SUBJECT`.

---

## 4. Local Development (`.env`)
For running locally with `npm run dev`, create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_SUBJECT=mailto:admin@albadr-society.org
```

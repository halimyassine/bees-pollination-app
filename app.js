/*
  Bees Pollination
  Browser-only demo using Pollinations BYOP OAuth + PKCE.

  Before deployment:
  1. Create a Pollinations publishable App Key (pk_...) at enter.pollinations.ai.
  2. Add this site's exact URL as the Redirect URI.
  3. Put the pk_... value below.
*/

const CLIENT_ID = "REPLACE_WITH_YOUR_POLLINATIONS_APP_KEY";
const AUTH_BASE = "https://enter.pollinations.ai/authorize";
const TOKEN_URL = "https://enter.pollinations.ai/api/oauth/token";
const IMAGE_BASE = "https://gen.pollinations.ai/image/";
const MODEL = "zimage";

const statusEl = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const generateBtn = document.getElementById("generateBtn");
const promptEl = document.getElementById("prompt");
const loadingEl = document.getElementById("loading");
const resultEl = document.getElementById("result");
const imageEl = document.getElementById("generatedImage");
const downloadEl = document.getElementById("downloadBtn");

const REDIRECT_URI = window.location.origin + window.location.pathname;
const TOKEN_KEY = "bees_pollinations_access_token";
const VERIFIER_KEY = "bees_pollinations_pkce_verifier";
const STATE_KEY = "bees_pollinations_oauth_state";

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(length = 64) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return base64url(bytes);
}

async function sha256(text) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
}

async function connect() {
  if (CLIENT_ID.startsWith("REPLACE_")) {
    statusEl.textContent = "Add your Pollinations App Key to app.js first.";
    return;
  }
  const verifier = randomString();
  const state = randomString(32);
  const challenge = base64url(await sha256(verifier));
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const u = new URL(AUTH_BASE);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", REDIRECT_URI);
  u.searchParams.set("scope", "profile usage");
  u.searchParams.set("models", MODEL);
  u.searchParams.set("expiry", "7");
  u.searchParams.set("budget", "1");
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");
  window.location.href = u.toString();
}

async function handleCallback() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");
  if (!code) return;

  if (state !== sessionStorage.getItem(STATE_KEY)) {
    throw new Error("OAuth state mismatch.");
  }

  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  });

  if (!res.ok) throw new Error("Pollinations authorization failed.");
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access_token);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  history.replaceState({}, "", REDIRECT_URI);
}

function token() {
  return localStorage.getItem(TOKEN_KEY);
}

async function generate() {
  const t = token();
  const prompt = promptEl.value.trim();
  if (!t || !prompt) return;

  loadingEl.hidden = false;
  resultEl.hidden = true;
  generateBtn.disabled = true;

  try {
    const url = IMAGE_BASE + encodeURIComponent(prompt) +
      "?model=" + encodeURIComponent(MODEL) + "&width=1024&height=1024&nologo=true";

    const res = await fetch(url, {
      headers: {"Authorization": "Bearer " + t}
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Image generation failed.");
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    imageEl.src = objectUrl;
    downloadEl.href = objectUrl;
    resultEl.hidden = false;
    statusEl.textContent = "Image generated successfully.";
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
  } finally {
    loadingEl.hidden = true;
    generateBtn.disabled = false;
  }
}

async function init() {
  try {
    await handleCallback();
    if (token()) {
      statusEl.textContent = "Connected to Pollinations.";
      connectBtn.textContent = "Connected";
      connectBtn.disabled = true;
      generateBtn.disabled = false;
    }
  } catch (err) {
    statusEl.textContent = "Connection error: " + err.message;
  }
}

connectBtn.addEventListener("click", connect);
generateBtn.addEventListener("click", generate);
init();

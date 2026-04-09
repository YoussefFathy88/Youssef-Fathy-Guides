"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export type OAuthGrantType = "AuthorizationCode" | "ClientCredentials" | "Implicit";

export interface OAuthFlowStepperProps {
  title?: string;
  caption?: string;
  defaultGrantType?: OAuthGrantType;
}

// ─── Actor definitions ────────────────────────────────────────────────────────

const ACTORS = ["User/Browser", "Client App", "Auth Server", "Resource Server"] as const;
type Actor = typeof ACTORS[number];

const ACTOR_COLOR: Record<Actor, { bg: string; border: string; text: string; dot: string }> = {
  "User/Browser":    { bg: "bg-violet-100 dark:bg-violet-900/40", border: "border-violet-300 dark:border-violet-700", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "Client App":      { bg: "bg-blue-100 dark:bg-blue-900/40",     border: "border-blue-300 dark:border-blue-700",     text: "text-blue-700 dark:text-blue-300",     dot: "bg-blue-500"   },
  "Auth Server":     { bg: "bg-amber-100 dark:bg-amber-900/40",   border: "border-amber-300 dark:border-amber-700",   text: "text-amber-700 dark:text-amber-300",   dot: "bg-amber-500"  },
  "Resource Server": { bg: "bg-teal-100 dark:bg-teal-900/40",     border: "border-teal-300 dark:border-teal-700",     text: "text-teal-700 dark:text-teal-300",     dot: "bg-teal-500"   },
};

// ─── Flow steps ───────────────────────────────────────────────────────────────

interface FlowStep {
  from: Actor;
  to: Actor;
  method: string;
  endpoint: string;
  detail: string;
  showJWT?: boolean;
}

const AUTH_CODE_FLOW: FlowStep[] = [
  {
    from: "User/Browser", to: "Auth Server",
    method: "GET", endpoint: "/authorize?response_type=code&client_id=app123&redirect_uri=…&scope=openid+profile",
    detail: "User clicks 'Login'. Browser redirects to the Authorization Server's login page.",
  },
  {
    from: "Auth Server", to: "User/Browser",
    method: "200 OK", endpoint: "Login form rendered",
    detail: "Auth Server presents a login form. User enters credentials and consents to the requested scopes.",
  },
  {
    from: "User/Browser", to: "Auth Server",
    method: "POST", endpoint: "/login  {username, password}",
    detail: "User submits credentials. Auth Server validates them and generates a short-lived authorization code.",
  },
  {
    from: "Auth Server", to: "Client App",
    method: "302 Redirect", endpoint: "/callback?code=abc123&state=xyz",
    detail: "Auth Server redirects the browser back to the Client App with a one-time authorization code. The code is single-use and expires in ~60 s.",
  },
  {
    from: "Client App", to: "Auth Server",
    method: "POST", endpoint: "/token  {code=abc123, client_secret=…, grant_type=authorization_code}",
    detail: "Client App exchanges the code for tokens by authenticating with its client_secret (server-to-server, never exposed to browser).",
    showJWT: true,
  },
  {
    from: "Auth Server", to: "Client App",
    method: "200 OK", endpoint: "{access_token, id_token, refresh_token, expires_in: 3600}",
    detail: "Auth Server returns a signed JWT access_token, an id_token (OpenID Connect), and an optional refresh_token.",
    showJWT: true,
  },
  {
    from: "Client App", to: "Resource Server",
    method: "GET", endpoint: "/api/profile  Authorization: Bearer <access_token>",
    detail: "Client App calls the Resource Server, attaching the access_token in the Authorization header.",
  },
  {
    from: "Resource Server", to: "Client App",
    method: "200 OK", endpoint: '{id:"u42", name:"Alice", email:"alice@example.com"}',
    detail: "Resource Server validates the JWT signature and claims (exp, aud, scope). Returns the protected resource.",
  },
];

const CLIENT_CRED_FLOW: FlowStep[] = [
  {
    from: "Client App", to: "Auth Server",
    method: "POST", endpoint: "/token  {grant_type=client_credentials, client_id, client_secret, scope=api:read}",
    detail: "No user is involved. The Client App authenticates directly with its credentials to get an access token.",
  },
  {
    from: "Auth Server", to: "Client App",
    method: "200 OK", endpoint: "{access_token, token_type: Bearer, expires_in: 3600}",
    detail: "Auth Server returns an access token scoped to the client (no user identity / id_token).",
    showJWT: true,
  },
  {
    from: "Client App", to: "Resource Server",
    method: "GET", endpoint: "/api/data  Authorization: Bearer <access_token>",
    detail: "Client App uses the bearer token to call the Resource Server on its own behalf (machine-to-machine).",
  },
  {
    from: "Resource Server", to: "Client App",
    method: "200 OK", endpoint: "{data: [...]}",
    detail: "Resource Server validates the token and returns the resource. No user session needed.",
  },
];

const IMPLICIT_FLOW: FlowStep[] = [
  {
    from: "User/Browser", to: "Auth Server",
    method: "GET", endpoint: "/authorize?response_type=token&client_id=spa123",
    detail: "⚠ Implicit flow is deprecated. It returns the access_token directly in the redirect URL fragment (no code exchange step).",
  },
  {
    from: "Auth Server", to: "User/Browser",
    method: "302 Redirect", endpoint: "/callback#access_token=eyJ…&token_type=Bearer",
    detail: "Token is returned in the URL fragment (never sent to server). Browser-only SPAs used this before PKCE was widely adopted.",
    showJWT: true,
  },
  {
    from: "User/Browser", to: "Resource Server",
    method: "GET", endpoint: "/api/data  Authorization: Bearer <access_token>",
    detail: "Browser calls the Resource Server directly with the token. No refresh_token is issued.",
  },
  {
    from: "Resource Server", to: "User/Browser",
    method: "200 OK", endpoint: "{data: [...]}",
    detail: "Resource Server validates the short-lived token and returns the data.",
  },
];

const FLOWS: Record<OAuthGrantType, FlowStep[]> = {
  AuthorizationCode: AUTH_CODE_FLOW,
  ClientCredentials: CLIENT_CRED_FLOW,
  Implicit: IMPLICIT_FLOW,
};

// ─── Sample JWT ───────────────────────────────────────────────────────────────

const JWT_HEADER   = { alg: "RS256", typ: "JWT" };
const JWT_PAYLOAD  = { sub: "u42", name: "Alice", email: "alice@example.com", aud: "app123", iss: "https://auth.example.com", iat: 1712000000, exp: 1712003600, scope: "openid profile email" };
const JWT_TOKEN    = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1NDIiLCJuYW1lIjoiQWxpY2UifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const PAYLOAD_FIELD_DESC: Record<string, string> = {
  sub: "Subject — unique user identifier",
  name: "User display name",
  email: "User email (requires profile scope)",
  aud: "Audience — intended recipient (your app)",
  iss: "Issuer — who created the token",
  iat: "Issued At (Unix timestamp)",
  exp: "Expiration time (Unix timestamp)",
  scope: "Permissions granted",
};

const GRANT_LABELS: Record<OAuthGrantType, string> = {
  AuthorizationCode: "Authorization Code",
  ClientCredentials: "Client Credentials",
  Implicit: "Implicit (deprecated)",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OAuthFlowStepper({
  title,
  caption,
  defaultGrantType = "AuthorizationCode",
}: OAuthFlowStepperProps) {
  const [grantType, setGrantType] = useState<OAuthGrantType>(defaultGrantType);
  const [stepIdx, setStepIdx] = useState(-1);
  const [showJWTDecoded, setShowJWTDecoded] = useState(false);

  const steps = FLOWS[grantType];
  const current = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;
  const showJWT = current?.showJWT;

  function handleGrant(g: OAuthGrantType) { setGrantType(g); setStepIdx(-1); setShowJWTDecoded(false); }
  const canBack = stepIdx > 0;
  const canNext = stepIdx < steps.length - 1;

  // Actor column x positions (in %)
  const ACTOR_PCTS = [12.5, 37.5, 62.5, 87.5];
  const actorIdx = (a: Actor) => ACTORS.indexOf(a);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
      {(title || caption) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h2>}
          {caption && <p className="text-xs text-gray-500 dark:text-gray-400">{caption}</p>}
        </div>
      )}

      {/* Grant type tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {(["AuthorizationCode", "ClientCredentials", "Implicit"] as OAuthGrantType[]).map(g => (
          <button
            key={g}
            type="button"
            onClick={() => handleGrant(g)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
              g === grantType
                ? "border-amber-300 bg-amber-500 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
            )}
          >
            {GRANT_LABELS[g]}
          </button>
        ))}
      </div>

      {/* Actor columns */}
      <div className="relative mb-3">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${ACTORS.length}, 1fr)` }}>
          {ACTORS.map(a => {
            const col = ACTOR_COLOR[a];
            const isActive = current?.from === a || current?.to === a;
            return (
              <div
                key={a}
                className={cn(
                  "rounded-xl border py-2 text-center text-[10px] font-bold transition-all",
                  isActive ? `${col.bg} ${col.border} ${col.text}` : "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900",
                )}
              >
                <div className={cn("mx-auto mb-1 h-2 w-2 rounded-full", isActive ? col.dot : "bg-gray-300 dark:bg-gray-600")} />
                {a}
              </div>
            );
          })}
        </div>

        {/* Arrow between actors */}
        {current && (
          <div className="relative mt-2 h-10">
            {(() => {
              const fromPct = ACTOR_PCTS[actorIdx(current.from)];
              const toPct   = ACTOR_PCTS[actorIdx(current.to)];
              const goRight = toPct > fromPct;
              const left  = Math.min(fromPct, toPct);
              const width = Math.abs(toPct - fromPct);
              return (
                <div
                  className="absolute top-4 flex items-center"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <div className="h-0.5 flex-1 bg-amber-400" />
                  {goRight && <div className="h-0 w-0 border-y-4 border-l-8 border-y-transparent border-l-amber-400" />}
                  {!goRight && <div className="order-first h-0 w-0 border-y-4 border-r-8 border-y-transparent border-r-amber-400" />}
                </div>
              );
            })()}
            <div className="absolute inset-x-0 top-0 text-center">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {current.method} {current.endpoint.length > 50 ? current.endpoint.slice(0, 50) + "…" : current.endpoint}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Step list */}
      <div className="mb-4 space-y-1.5 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
        {steps.map((s, i) => {
          const fromCol = ACTOR_COLOR[s.from];
          const toCol   = ACTOR_COLOR[s.to];
          const isActive = i === stepIdx;
          const isPast   = i < stepIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setStepIdx(i)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left transition-all",
                isActive ? "bg-amber-50 ring-2 ring-amber-300 dark:bg-amber-900/20" :
                isPast   ? "bg-gray-50 dark:bg-gray-800/50" : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold", fromCol.bg, fromCol.text)}>
                  {s.from.split("/")[0]}
                </span>
                <span className="text-[9px] text-gray-400">→</span>
                <span className={cn("inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold", toCol.bg, toCol.text)}>
                  {s.to.split("/")[0]}
                </span>
                <span className="font-mono text-[10px] text-gray-600 dark:text-gray-400">
                  {s.method} {s.endpoint.length > 40 ? s.endpoint.slice(0, 40) + "…" : s.endpoint}
                </span>
              </div>
              {isActive && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                  {s.detail}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* JWT anatomy panel */}
      {showJWT && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-700 dark:text-gray-200">JWT Anatomy</p>
            <button
              type="button"
              onClick={() => setShowJWTDecoded(d => !d)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {showJWTDecoded ? "Show encoded" : "Decode →"}
            </button>
          </div>

          {!showJWTDecoded ? (
            <div className="flex flex-wrap items-center gap-px font-mono text-[10px]">
              <span className="rounded bg-rose-100 px-1 py-0.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9
              </span>
              <span className="text-gray-400">.</span>
              <span className="rounded bg-blue-100 px-1 py-0.5 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                eyJzdWIiOiJ1NDIiLCJuYW1lIjoiQWxpY2UifQ
              </span>
              <span className="text-gray-400">.</span>
              <span className="rounded bg-teal-100 px-1 py-0.5 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
              </span>
              <div className="mt-2 flex w-full gap-6 text-[9px]">
                <span className="text-rose-500">█ Header</span>
                <span className="text-blue-500">█ Payload</span>
                <span className="text-teal-500">█ Signature</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Header */}
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-800 dark:bg-rose-900/20">
                <p className="mb-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">Header (decoded)</p>
                {Object.entries(JWT_HEADER).map(([k, v]) => (
                  <div key={k} className="flex gap-2 font-mono text-[10px]">
                    <span className="text-rose-700 dark:text-rose-300">{k}:</span>
                    <span className="text-gray-700 dark:text-gray-300">"{v}"</span>
                  </div>
                ))}
              </div>
              {/* Signature */}
              <div className="rounded-lg border border-teal-200 bg-teal-50 p-2 dark:border-teal-800 dark:bg-teal-900/20">
                <p className="mb-1 text-[10px] font-bold text-teal-600 dark:text-teal-400">Signature</p>
                <p className="font-mono text-[9px] text-teal-700 dark:text-teal-300">
                  RSASHA256(<br />
                  &nbsp; base64(header) + "." + base64(payload),<br />
                  &nbsp; privateKey<br />
                  )
                </p>
              </div>
              {/* Payload */}
              <div className="col-span-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="mb-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">Payload (decoded claims)</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {Object.entries(JWT_PAYLOAD).map(([k, v]) => (
                    <div key={k} className="flex gap-2 font-mono text-[9px]">
                      <span className="shrink-0 text-blue-700 dark:text-blue-300 font-bold">{k}:</span>
                      <span className="text-gray-700 dark:text-gray-300 truncate">
                        {typeof v === "number" ? v : `"${v}"`}
                      </span>
                      {PAYLOAD_FIELD_DESC[k] && (
                        <span className="text-gray-400 not-font-mono text-[8px]">← {PAYLOAD_FIELD_DESC[k]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400">{stepIdx + 1}/{steps.length}</span>
        <button
          type="button"
          disabled={!canBack}
          onClick={() => setStepIdx(s => s - 1)}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 disabled:opacity-30 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ← Back
        </button>
        <button
          type="button"
          disabled={!canNext && stepIdx >= 0}
          onClick={() => stepIdx < 0 ? setStepIdx(0) : setStepIdx(s => Math.min(steps.length - 1, s + 1))}
          className="flex h-8 items-center gap-1 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-30"
        >
          {stepIdx < 0 ? "Start →" : canNext ? "Next →" : "Done ✓"}
        </button>
        <button
          type="button"
          onClick={() => { setStepIdx(-1); setShowJWTDecoded(false); }}
          className="flex h-8 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          ↩ Reset
        </button>
      </div>
    </div>
  );
}

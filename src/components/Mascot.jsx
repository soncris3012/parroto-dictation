import React from "react";

export function MascotSvg({ size = 48, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      viewBox="0 0 566.93 566.93"
      width={size}
      height={size}
      className={className}
    >
      <path
        fill="#4198D3"
        stroke="#1F3769"
        strokeMiterlimit="10"
        strokeWidth="24.781"
        d="M397.9 502.5H168.1c-61.08 0-110.6-49.52-110.6-110.6V175.1c0-61.08 49.52-110.6 110.6-110.6h229.8c61.08 0 110.6 49.52 110.6 110.6v216.8c0 61.08-49.52 110.6-110.6 110.6z"
      />
      <circle cx="377.9" cy="244.15" r="70.85" fill="#FFF" />
      <circle cx="361.33" cy="244.74" r="44.8" fill="#0A1937" />
      <circle cx="184.9" cy="245.15" r="70.85" fill="#FFF" />
      <circle cx="202.33" cy="245.74" r="44.8" fill="#0A1937" />
      <path
        fill="#02579E"
        d="M284.5 143.5c-4.29.21-8.74-.68-12.8-2.69-4.05-2-7.71-5.26-10-9.54-2.32-4.29-3-9.29-2.55-13.97.23-2.36.74-4.68 1.54-6.95.4-1.14.9-2.26 1.51-3.38.32-.56.65-1.12 1.07-1.7.41-.57.87-1.15 1.58-1.77.16-.15.37-.31.59-.47.11-.08.22-.15.34-.23l.44-.24c.55-.29 1.47-.62 2.59-.54.58.06 1.19.2 1.64.45.24.12.48.26.69.4.16.13.32.26.47.4.34.31.5.52.69.77.21.27.31.45.43.66.45.8.69 1.43.9 2 .21.58.38 1.09.55 1.6.62 2.02 1.22 3.62 2.11 5.09.87 1.5 2.05 2.85 3.4 4.11s2.95 2.34 4.61 3.36c3.38 2 7.17 3.58 11.09 4.93 3.93 1.37 8 2.49 12.13 3.7-2.14.13-4.29.21-6.44.13-1.08 0-2.16-.06-3.23-.16-1.08-.09-2.16-.17-3.24-.33-4.31-.55-8.63-1.58-12.82-3.38-4.15-1.81-8.25-4.61-11.09-8.79-1.44-2.07-2.35-4.47-3.06-6.45l-.5-1.4c-.16-.43-.33-.78-.4-.89-.01-.02-.04-.07 0 0 .03.04.03.04.17.18.05.05.11.1.18.13.1.08.22.16.34.21.23.09.56.23.88.23.59.05.98-.14 1.07-.17.03-.01.06-.03.08-.05.01-.01.01 0 .02 0 .01-.01.01-.01-.03.02-.1.07-.32.31-.52.6-.21.27-.42.63-.63.98-.41.73-.78 1.55-1.11 2.39-.68 1.69-1.13 3.52-1.44 5.36-.58 3.68-.37 7.44.94 10.83 1.3 3.42 3.74 6.52 6.86 8.97 3.09 2.49 6.85 4.31 10.95 5.6"
      />
      <path
        fill="#FFC817"
        d="M294.5 260.5c-10.73-4.6-21.64-.5-28 2-31.88 12.51-46.09 48.59-47 51 0 0-12.02 31.76-1 68 .1.34.21.68.21.68 1.13 3.59 4.99 14.75 13.79 26.32 1.6 2.11 12.45 16.17 17 14 2.49-1.19 1.08-6.28 3-16a63.3 63.3 0 0 1 5-15c.56.77 14.42 19.26 35.09 16.71 10.2-1.26 17.08-7.02 19.91-9.71 5.47-4.86 14.17-13.7 21-27 7.69-14.97 18.01-45.37 6-57-6.24-6.05-16.34-4.91-22-15-.49-.88-1.33-3.25-3-8-4.81-13.67-4.43-15.83-7-20-4.33-7.03-11.17-10.21-13-11"
      />
      <path
        fill="#FCDF4B"
        d="M268.5 270.5c-2.66-2.54-27.96 11.44-40 37-13.24 28.1-5.57 59.8-2 60 2.74.16 1.89-18.39 13-46 13.29-33.05 31.47-48.64 29-51"
      />
    </svg>
  );
}

export default function Mascot({ mood = "happy", message = "Hãy nghe và gõ lại những gì bạn nghe được nhé!" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div className="animate-mascot" style={{ flexShrink: 0 }}>
        <MascotSvg size={54} />
      </div>
      <div
        style={{
          position: "relative",
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "14px",
          padding: "8px 14px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--foreground)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          maxWidth: "320px"
        }}
      >
        <span style={{ display: "inline-block" }}>{message}</span>
        {/* Speech triangle */}
        <div
          style={{
            position: "absolute",
            left: "-8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            borderRight: "8px solid var(--border)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-6px",
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderRight: "7px solid var(--card)"
          }}
        />
      </div>
    </div>
  );
}

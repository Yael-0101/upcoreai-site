import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const svg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 48 48'>" +
  "<rect width='48' height='48' rx='13' fill='#C8623D'/>" +
  "<ellipse cx='24' cy='24' rx='14' ry='6' fill='none' stroke='#F7EFE6' stroke-opacity='0.28' stroke-width='1.4' transform='rotate(-22 24 24)'/>" +
  "<path d='M16 15.5 V25 a8 8 0 0 0 16 0 V15.5' fill='none' stroke='#F7EFE6' stroke-width='4.4' stroke-linecap='round'/>" +
  "<circle cx='24' cy='15.5' r='2.3' fill='#F7EFE6'/>" +
  "</svg>";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          width="180"
          height="180"
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        />
      </div>
    ),
    { ...size }
  );
}

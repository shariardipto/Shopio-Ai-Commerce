"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

const MAX_WIDTH = 1280;

function cameraErrorMessage(error) {
  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was blocked. Allow camera permission in your browser, or upload an image instead.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera was found on this device.";
    case "NotReadableError":
      return "The camera is being used by another app. Close it and try again.";
    default:
      return "Could not open the camera. Please try again or upload an image instead.";
  }
}

/*
  Live camera preview with a "Take Photo" button.
  Uses the browser camera API (getUserMedia). It needs HTTPS or localhost,
  which is true on Vercel and during local development.
  If the live camera is not available, the user can still use the phone's
  camera app or upload an image instead.
*/
export default function CameraCapture({ onCapture, onUseUpload }) {
  const videoRef = useRef(null);
  const cameraAppInputRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment"); // back camera on phones
  const [ready, setReady] = useState(false);
  const [mirrored, setMirrored] = useState(false);
  const [canSwitch, setCanSwitch] = useState(false);
  const [error, setError] = useState(() =>
    typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia
      ? ""
      : "Live camera is not available here (it needs HTTPS). You can still take a photo with your device's camera app."
  );

  // Start the camera, and stop it again when this component closes.
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;

    let stream = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      .then(async (mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        const video = videoRef.current;
        video.srcObject = mediaStream;
        await video.play().catch(() => {});

        // Front cameras and laptop webcams look natural when mirrored, like a mirror.
        const settings = mediaStream.getVideoTracks()[0]?.getSettings() || {};
        setMirrored(settings.facingMode !== "environment");
        setReady(true);

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!cancelled) setCanSwitch(devices.filter((device) => device.kind === "videoinput").length > 1);
      })
      .catch((err) => {
        if (!cancelled) setError(cameraErrorMessage(err));
      });

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  function switchCamera() {
    setReady(false);
    setFacingMode((current) => (current === "environment" ? "user" : "environment"));
  }

  // Copies the current video frame onto a canvas and turns it into a JPEG file.
  function takePhoto() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;

    const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(new File([blob], "camera-photo.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9
    );
  }

  function handleCameraAppPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onCapture(file);
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
          <Icon name="camera" className="h-6 w-6" />
        </span>
        <p className="mt-3 text-sm text-gray-600">{error}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => cameraAppInputRef.current?.click()} className="btn-primary">
            Open Camera App
          </button>
          <button type="button" onClick={onUseUpload} className="btn-secondary">
            Upload Image Instead
          </button>
        </div>
        {/* capture="environment" opens the phone's camera app directly */}
        <input
          ref={cameraAppInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraAppPhoto}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-contain ${mirrored ? "-scale-x-100" : ""}`}
        />

        {/* Viewfinder corners */}
        {ready && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-8 animate-fade-in">
            <span className="absolute top-0 left-0 h-6 w-6 rounded-tl-lg border-t-2 border-l-2 border-white/80" />
            <span className="absolute top-0 right-0 h-6 w-6 rounded-tr-lg border-t-2 border-r-2 border-white/80" />
            <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-white/80" />
            <span className="absolute right-0 bottom-0 h-6 w-6 rounded-br-lg border-r-2 border-b-2 border-white/80" />
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 text-sm text-white/80">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Starting camera...
          </div>
        )}

        {ready && canSwitch && (
          <button
            type="button"
            onClick={switchCamera}
            aria-label="Switch camera"
            title="Switch camera"
            className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/70"
          >
            <Icon name="refresh" className="h-5 w-5" />
          </button>
        )}

        {/* Shutter button, like a phone camera app */}
        {ready && (
          <button
            type="button"
            onClick={takePhoto}
            aria-label="Take photo"
            className="absolute bottom-4 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white/90 bg-white/20 backdrop-blur transition hover:bg-white/40 active:scale-90"
          >
            <span className="h-11 w-11 rounded-full bg-white" />
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">Point the camera at a product, then tap the white button.</p>
    </div>
  );
}

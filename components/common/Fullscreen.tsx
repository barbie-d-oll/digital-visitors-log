"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Maximize, Minimize } from "lucide-react";

import { Button } from "../ui/button";

type FullscreenDocument = Document & {
  mozCancelFullScreen?: () => Promise<void>;
  mozFullScreenElement?: Element | null;
  msExitFullscreen?: () => Promise<void>;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
};

type FullscreenElement = HTMLElement & {
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
};

const getFullscreenElement = () => {
  const fullscreenDocument = document as FullscreenDocument;

  return (
    fullscreenDocument.fullscreenElement ||
    fullscreenDocument.webkitFullscreenElement ||
    fullscreenDocument.mozFullScreenElement ||
    fullscreenDocument.msFullscreenElement
  );
};

const subscribeToHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

const subscribeToFullscreen = (onStoreChange: () => void) => {
  document.addEventListener("fullscreenchange", onStoreChange);
  document.addEventListener("webkitfullscreenchange", onStoreChange);

  return () => {
    document.removeEventListener("fullscreenchange", onStoreChange);
    document.removeEventListener("webkitfullscreenchange", onStoreChange);
  };
};

const getFullscreenSnapshot = () => !!getFullscreenElement();
const getServerFullscreenSnapshot = () => false;

export default function FullScreenButton() {
  const hasMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreen,
    getFullscreenSnapshot,
    getServerFullscreenSnapshot,
  );

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? "auto" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const enterFullScreen = () => {
    const body = document.body as FullscreenElement;
    const request =
      body.requestFullscreen ||
      body.webkitRequestFullscreen ||
      body.mozRequestFullScreen ||
      body.msRequestFullscreen;

    void request?.call(body);
  };

  const exitFullScreen = () => {
    const fullscreenDocument = document as FullscreenDocument;
    const exit =
      fullscreenDocument.exitFullscreen ||
      fullscreenDocument.webkitExitFullscreen ||
      fullscreenDocument.mozCancelFullScreen ||
      fullscreenDocument.msExitFullscreen;

    void exit?.call(fullscreenDocument);
  };

  if (!hasMounted) {
    return <div aria-hidden="true" className="size-8 shrink-0" />;
  }

  return (
    <Button
      type="button"
      onClick={isFullscreen ? exitFullScreen : enterFullScreen}
      size="icon"
      variant="outline"
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="size-4" />
      ) : (
        <Maximize className="size-4" />
      )}
    </Button>
  );
}

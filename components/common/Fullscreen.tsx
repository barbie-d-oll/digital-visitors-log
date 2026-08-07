"use client";

import { useEffect, useState } from "react";
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

export default function FullScreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = getFullscreenElement();
      setIsFullscreen(!!fullscreenElement);
      document.body.style.overflow = fullscreenElement ? "auto" : "";
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

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

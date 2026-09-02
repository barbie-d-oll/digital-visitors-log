"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, Upload, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  DashboardPanel,
  FormField,
  LoadingState,
  PageHeader,
  fieldControlClassName,
} from "../../../_components/dashboard/DashboardPrimitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, type UserProfile } from "@/context/AuthContext";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [role, setRole] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const applyProfile = useCallback((profile: UserProfile) => {
    setName(profile.name || "");
    setEmail(profile.email || "");
    setAvatar(profile.avatar || "");
    setRole(profile.role || "");
    setOrganizationName(profile.organizationName || "");
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok || !data.user) {
        setError(data.error || "Failed to load profile.");
        return;
      }

      applyProfile(data.user as UserProfile);
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [applyProfile, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (user) {
        applyProfile(user);
        setLoading(false);
        return;
      }

      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [applyProfile, loadProfile, user]);

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || typeof data.avatarUrl !== "string") {
        const message = data.error || "Failed to upload avatar.";
        setError(message);
        toast.error(message);
        return;
      }

      setAvatar(data.avatarUrl);
      await refresh();
      const message = "Avatar uploaded successfully.";
      setSuccess(message);
      toast.success(message);
    } catch (err) {
      console.error(err);
      const message = "Failed to upload avatar.";
      setError(message);
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        const message = data.error || "Failed to update profile.";
        setError(message);
        toast.error(message);
        return;
      }

      applyProfile(data.user as UserProfile);
      await refresh();
      const message = "Profile updated successfully.";
      setSuccess(message);
      toast.success(message);
    } catch (err) {
      console.error(err);
      const message = "Failed to update profile.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading profile" />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Profile"
        description="Update your account details and profile image."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      <DashboardPanel
        title="Profile Details"
        description="Your name and avatar appear in the dashboard header."
        className="max-w-4xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar size="lg" className="size-20">
              <AvatarImage src={avatar} alt={name || "User"} />
              <AvatarFallback className="text-lg">
                {name ? getInitials(name) : <UserRound className="size-7" />}
              </AvatarFallback>
            </Avatar>

            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <FormField
                label="Avatar URL"
                htmlFor="profile-avatar"
                helper="Paste a remote image URL or upload an image."
              >
                <input
                  id="profile-avatar"
                  className={fieldControlClassName}
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  placeholder="https://..."
                />
              </FormField>

              <label
                className={` h-5 my-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-semibold transition ${
                  uploadingAvatar
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer bg-card hover:border-ring hover:bg-accent"
                }`}
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {uploadingAvatar ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Full Name" htmlFor="profile-name">
              <input
                id="profile-name"
                className={fieldControlClassName}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </FormField>

            <FormField label="Email" htmlFor="profile-email">
              <input
                id="profile-email"
                type="email"
                className={fieldControlClassName}
                value={email}
                disabled
              />
            </FormField>

            <FormField label="Role" htmlFor="profile-role">
              <input
                id="profile-role"
                className={fieldControlClassName}
                value={role}
                disabled
              />
            </FormField>

            <FormField label="Organization" htmlFor="profile-organization">
              <input
                id="profile-organization"
                className={fieldControlClassName}
                value={organizationName}
                disabled
              />
            </FormField>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving || uploadingAvatar}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </DashboardPanel>
    </div>
  );
}

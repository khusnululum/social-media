"use client";

import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/services/post.service";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AddPostPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();
  const captionLimit = 300;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const mutation = useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
      router.push("/feed");
      toast.success("Success Post");

      setImage(null);
      setPreview(null);
      setCaption("");
    },
    onError: () => {
      toast.error("Failed to upload post");
    },
  });

  queryClient.invalidateQueries({
    queryKey: ["my-posts"],
  });

  const handleImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    handleImage(e.target.files[0]);
  };

  const handleDeleteImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    if (!image) return;

    const formData = new FormData();

    formData.append("image", image);
    formData.append("caption", caption);

    mutation.mutate(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file) handleImage(file);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white p-4 space-y-6">
      {/* Photo Upload */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400">Photo</p>

        <label className="cursor-pointer">
          <input
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />

          <div
            className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center
  ${error ? "border-pink-500 border-dashed" : "border-neutral-800 border-dashed"}
  `}
          >
            {!preview && (
              <>
                <UploadCloud size={28} className="text-gray-400" />

                <p className="text-primary text-sm mt-2">Click to upload</p>

                <p className="text-gray-500 text-xs">PNG or JPG (max. 5mb)</p>
              </>
            )}
          </div>
        </label>
        {/* Helper Text */}
        {error && <p className="text-xs text-pink-500">{error}</p>}
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          <img src={preview} className="rounded-xl w-full object-cover" />

          <div className="flex gap-3">
            <label className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />

              <Button
                type="button"
                variant="default"
                onClick={openFilePicker}
                className="w-full bg-neutral-900"
              >
                Change Image
              </Button>
            </label>

            <Button
              variant="default"
              className="flex-1 text-accent-red bg-neutral-900"
              onClick={handleDeleteImage}
            >
              Delete Image
            </Button>
          </div>
        </div>
      )}

      {/* Caption */}
      <div className="space-y-2">
        <p className="text-sm text-gray-400">Caption</p>

        <Textarea
          placeholder="Create your caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="bg-neutral-900 border-neutral-800 text-white"
        />
      </div>
      {/* Helper */}
      <p className="text-xs text-gray-500 text-right">
        {caption.length}/{captionLimit}
      </p>

      {/* Share Button */}
      <Button
        onClick={handleSubmit}
        disabled={!image || mutation.isPending}
        className="w-full rounded-full bg-primary-300"
      >
        {mutation.isPending ? "Uploading..." : "Share"}
      </Button>
    </div>
  );
}

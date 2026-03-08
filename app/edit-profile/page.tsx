"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateProfile } from "@/services/user.service";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import { Slider } from "@/components/ui/slider";

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMyProfile,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profile = data?.data?.profile;

  const [name, setName] = useState(profile?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState(profile?.avatarUrl || "");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [cropImage, setCropImage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/profile");
      toast.success("Profile Success Update");
    },
  });

  const handleImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setCropImage(url);
  };

  const handleCropSave = async () => {
    if (!cropImage || !croppedAreaPixels) return;

    const croppedFile = await getCroppedImg(
      cropImage,
      croppedAreaPixels,
      "avatar.jpg",
    );

    setAvatar(croppedFile);
    setPreview(URL.createObjectURL(croppedFile));
    setCropImage(null);
  };

  const handleSubmit = () => {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("username", username);
    formData.append("phone", phone);
    formData.append("bio", bio);

    if (avatar) {
      formData.append("avatar", avatar);
    }

    mutation.mutate(formData);
  };

  const getInitials = (name?: string) => {
    if (!name) return "";

    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-black text-white min-h-screen max-w-md mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
        <h1 className="font-semibold text-lg">Edit Profile</h1>
      </div>

      {/* Avatar */}
      {cropImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="relative flex-1">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, croppedPixels) =>
                setCroppedAreaPixels(croppedPixels)
              }
            />
          </div>
          {/* Zoom Slider */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-neutral-400">Zoom</p>

            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>

          <div className="p-4 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-neutral-900"
              onClick={() => setCropImage(null)}
            >
              Cancel
            </Button>

            <Button className="flex-1 bg-primary-300" onClick={handleCropSave}>
              Save
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <Avatar className="w-15 h-15">
          <AvatarImage src={preview} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>

        <Label>
          <Input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => e.target.files && handleImage(e.target.files[0])}
          />

          <Button
            variant="outline"
            className="rounded-full bg-transparent border-neutral-900"
            onClick={() => fileInputRef.current?.click()}
          >
            Change Photo
          </Button>
        </Label>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm mb-1">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-neutral-950 border-neutral-900"
          />
        </div>

        <div>
          <Label className="text-sm mb-1">Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-neutral-950 border-neutral-900"
          />
        </div>

        <div>
          <Label className="text-sm mb-1">Number Phone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-neutral-950 border-neutral-900"
          />
        </div>

        <div>
          <Label className="text-sm mb-1">Bio</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-neutral-950 border-neutral-900"
          />
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSubmit}
        className="w-full rounded-full bg-primary-300"
      >
        Save Changes
      </Button>
    </div>
  );
}

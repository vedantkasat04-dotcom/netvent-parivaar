import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Cropper, { Area } from "react-easy-crop";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import {
  useUpdateMe, useSetAvailability, useListExpertise, getListExpertiseQueryKey,
  UpdateProfileInputEducationType, UpdateProfileInputDegreeLevel,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityCombobox } from "@/components/CityCombobox";
import { ExpertiseMultiSelect } from "@/components/ExpertiseMultiSelect";
import { useToast } from "@/hooks/use-toast";
import { MapPin, GraduationCap, Pencil, Mail, Phone, Camera, Upload, Loader2, ZoomIn, ZoomOut } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = "ps0z2wgb";
const CLOUDINARY_UPLOAD_PRESET = "netvent_avatars";
const MAX_FILE_SIZE_MB = 2;

const SCHOOL_CLASSES = ["8th", "9th", "10th", "11th", "12th"];
const COLLEGE_YEARS = ["1st", "2nd", "3rd", "4th", "5th"];

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: "Enter a valid 10-digit phone number." }),
  city: z.string().min(1, { message: "Please select your city." }),
  educationType: z.enum([UpdateProfileInputEducationType.SCHOOL, UpdateProfileInputEducationType.COLLEGE]),
  schoolOrCollegeName: z.string().min(2, { message: "Please enter your institution name." }),
  schoolClass: z.string().optional(),
  degreeLevel: z.string().optional(),
  collegeYear: z.string().optional(),
  bio: z.string().max(500, { message: "Bio must be under 500 characters." }).optional(),
  avatarUrl: z.string().url({ message: "Enter a valid URL." }).optional().or(z.literal("")),
  expertiseIds: z.array(z.string())
    .min(1, { message: "Select at least 1 skill." })
    .max(6, { message: "Select up to 6 skills." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Cloudinary upload helper — accepts Blob or File, returns secure_url
async function uploadToCloudinary(file: Blob | File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload succeeded but no URL returned");
  return data.secure_url as string;
}

// Read file as data URL (needed for cropper preview)
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Generate cropped image blob from source + crop area
async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise((res, rej) => {
    image.onload = res;
    image.onerror = rej;
  });

  // Output size — max 512x512 for reasonable file size, good enough for avatars
  const outputSize = Math.min(512, pixelCrop.width);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, outputSize, outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas is empty"))),
      "image/jpeg",
      0.92
    );
  });
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [available, setAvailable] = useState(user?.isAvailable ?? true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  // Where should the uploaded URL land: "profile" saves to backend immediately, "form" updates form field only
  const [cropperTarget, setCropperTarget] = useState<"profile" | "form">("profile");

  // Hidden file input refs
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const dialogFileInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useUpdateMe();
  const availabilityMutation = useSetAvailability();
  const { data: expertiseData } = useListExpertise({ query: { queryKey: getListExpertiseQueryKey() } });

  useEffect(() => {
    if (user) setAvailable(user.isAvailable);
  }, [user?.isAvailable]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      city: user.city ?? "",
      educationType: (user.educationType ?? UpdateProfileInputEducationType.COLLEGE) as ProfileFormValues["educationType"],
      schoolOrCollegeName: user.schoolOrCollegeName ?? "",
      schoolClass: user.schoolClass ?? "",
      degreeLevel: user.degreeLevel ?? "",
      collegeYear: user.collegeYear ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
      expertiseIds: user.expertise?.map(e => e.id) ?? [],
    } : undefined,
  });

  const educationType = form.watch("educationType");
  const avatarUrlWatch = form.watch("avatarUrl");

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Please select an image file (JPG, PNG, WebP).";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`;
    return null;
  };

  // File selected → open cropper
  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "profile" | "form"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast({ title: "Invalid file", description: validationError, variant: "destructive" });
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setCropperImage(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropperTarget(target);
      setCropperOpen(true);
    } catch (err) {
      toast({ title: "Could not read file", description: "Please try again.", variant: "destructive" });
    } finally {
      e.target.value = "";
    }
  };

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Save profile avatar directly to backend
  const saveAvatarToBackend = async (secureUrl: string) => {
    if (!user) throw new Error("Not logged in");
    const isSchool = user.educationType === "SCHOOL";
    await new Promise<void>((resolve, reject) => {
      updateMutation.mutate({
        data: {
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          city: user.city ?? "",
          educationType: user.educationType as UpdateProfileInputEducationType,
          schoolOrCollegeName: user.schoolOrCollegeName ?? "",
          schoolClass: isSchool ? user.schoolClass ?? null : null,
          degreeLevel: isSchool ? null : (user.degreeLevel as UpdateProfileInputDegreeLevel) ?? null,
          collegeYear: isSchool ? null : user.collegeYear ?? null,
          bio: user.bio ?? null,
          avatarUrl: secureUrl,
          expertiseIds: user.expertise?.map(ex => ex.id) ?? [],
        },
      }, {
        onSuccess: () => resolve(),
        onError: (err) => reject(err),
      });
    });
    await refreshUser();
  };

  // Confirm crop → upload → save
  const handleCropConfirm = async () => {
    if (!cropperImage || !croppedAreaPixels) return;
    setUploadingAvatar(true);
    try {
      const blob = await getCroppedBlob(cropperImage, croppedAreaPixels);
      const secureUrl = await uploadToCloudinary(blob);

      if (cropperTarget === "profile") {
        await saveAvatarToBackend(secureUrl);
        toast({ title: "Photo updated", description: "Your new profile photo is live." });
      } else {
        form.setValue("avatarUrl", secureUrl, { shouldValidate: true, shouldDirty: true });
        toast({ title: "Photo uploaded", description: "Click 'Save changes' to apply." });
      }

      setCropperOpen(false);
      setCropperImage(null);
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.message || "Could not upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setCropperImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const onSubmit = (data: ProfileFormValues) => {
    const isSchool = data.educationType === UpdateProfileInputEducationType.SCHOOL;
    updateMutation.mutate({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        educationType: data.educationType,
        schoolOrCollegeName: data.schoolOrCollegeName,
        schoolClass: isSchool ? data.schoolClass || null : null,
        degreeLevel: isSchool ? null : (data.degreeLevel as UpdateProfileInputDegreeLevel) || null,
        collegeYear: isSchool ? null : data.collegeYear || null,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
        expertiseIds: data.expertiseIds,
      },
    }, {
      onSuccess: async () => {
        await refreshUser();
        setEditOpen(false);
        toast({ title: "Profile updated", description: "Your changes have been saved." });
      },
      onError: (error) => {
        toast({ title: "Update failed", description: error.data?.error?.message || "Could not update profile.", variant: "destructive" });
      },
    });
  };

  const handleAvailabilityChange = (next: boolean) => {
    setAvailable(next);
    availabilityMutation.mutate({ data: { isAvailable: next } }, {
      onSuccess: async () => {
        await refreshUser();
        toast({
          title: next ? "You're now available" : "You're now unavailable",
          description: next ? "Your card appears in full colour in the directory." : "Your card now appears in grayscale.",
        });
      },
      onError: (error) => {
        setAvailable(!next);
        toast({ title: "Update failed", description: error.message || "Could not update availability.", variant: "destructive" });
      },
    });
  };

  if (!user) {
    return <AppLayout><div className="container py-20 text-center">Loading…</div></AppLayout>;
  }

  const eduLabel = user.educationType === "SCHOOL"
    ? `${user.schoolOrCollegeName ?? ""}${user.schoolClass ? ` · Class ${user.schoolClass}` : ""}`
    : `${user.schoolOrCollegeName ?? ""}${user.degreeLevel ? ` · ${user.degreeLevel.charAt(0) + user.degreeLevel.slice(1).toLowerCase()}` : ""}${user.collegeYear ? ` · ${user.collegeYear} Year` : ""}`;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="font-heading text-3xl font-bold mb-8" style={{ color: NAVY }}>My Parivaar</h1>

        {/* Hidden file inputs */}
        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelected(e, "profile")}
        />

        {/* Cropper Dialog — WhatsApp-style */}
        <Dialog open={cropperOpen} onOpenChange={(open) => !open && !uploadingAvatar && handleCropCancel()}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Adjust your photo</DialogTitle>
              <DialogDescription>Drag to reposition · Pinch or use slider to zoom</DialogDescription>
            </DialogHeader>

            {/* Cropper area — square canvas with round crop mask */}
            <div className="relative w-full h-[320px] bg-black">
              {cropperImage && (
                <Cropper
                  image={cropperImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            {/* Zoom slider */}
            <div className="px-6 py-4 flex items-center gap-3 bg-muted/30">
              <ZoomOut className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-current"
                style={{ accentColor: TEAL }}
                disabled={uploadingAvatar}
              />
              <ZoomIn className="w-4 h-4 flex-shrink-0" style={{ color: TEAL }} />
            </div>

            <DialogFooter className="p-4 pt-2 gap-2">
              <Button variant="outline" onClick={handleCropCancel} disabled={uploadingAvatar}>
                Cancel
              </Button>
              <Button
                onClick={handleCropConfirm}
                disabled={uploadingAvatar || !croppedAreaPixels}
                className="gap-2 font-semibold"
                style={{ background: TEAL }}
              >
                {uploadingAvatar ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                ) : (
                  <>Save photo</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 overflow-hidden">
              <div className="h-24" style={{ background: `linear-gradient(120deg, ${TEAL}, #2d8576)` }} />
              <CardContent className="p-6 -mt-12">
                <div className="flex items-end justify-between mb-4">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-muted">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold font-heading" style={{ background: "rgba(63,167,150,0.15)", color: TEAL }}>
                          {user.name.charAt(0)}
                        </div>
                      )}
                      {uploadingAvatar && !cropperOpen && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => !uploadingAvatar && avatarFileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: TEAL, border: "2px solid white" }}
                      title={uploadingAvatar ? "Uploading…" : "Change photo"}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>

                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full gap-2" style={{ borderColor: TEAL, color: TEAL }}>
                        <Pencil className="w-4 h-4" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your details. Changes appear in the directory.</DialogDescription>
                      </DialogHeader>

                      <input
                        ref={dialogFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelected(e, "form")}
                      />

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <span className="inline-flex items-center px-3 h-11 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground">+91</span>
                                  <Input type="tel" inputMode="numeric" maxLength={10} className="h-11 rounded-l-none" value={field.value}
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))} />
                                </div>
                              </FormControl><FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="city" render={({ field }) => (
                            <FormItem><FormLabel>City</FormLabel><FormControl><CityCombobox value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                          )} />

                          {/* Photo upload — opens cropper */}
                          <FormField control={form.control} name="avatarUrl" render={() => (
                            <FormItem>
                              <FormLabel>Profile Photo <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-border relative"
                                  style={{ background: "rgba(63,167,150,0.1)" }}>
                                  {avatarUrlWatch ? (
                                    <img src={avatarUrlWatch} alt="Preview" className="w-full h-full object-cover"
                                      onError={(e) => (e.currentTarget.style.display = "none")} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Camera className="w-6 h-6" style={{ color: TEAL, opacity: 0.5 }} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 flex flex-col gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={uploadingAvatar}
                                    onClick={() => dialogFileInputRef.current?.click()}
                                    className="gap-2 w-full"
                                    style={{ borderColor: TEAL, color: TEAL }}
                                  >
                                    <Upload className="w-4 h-4" /> {avatarUrlWatch ? "Change Photo" : "Upload Photo"}
                                  </Button>
                                  {avatarUrlWatch && (
                                    <button
                                      type="button"
                                      onClick={() => form.setValue("avatarUrl", "", { shouldDirty: true })}
                                      className="text-xs text-muted-foreground hover:text-destructive text-left"
                                    >
                                      Remove photo
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG, or WebP · Max {MAX_FILE_SIZE_MB}MB · You can crop and zoom
                              </p>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Bio <span className="text-muted-foreground font-normal">(optional)</span></FormLabel><FormControl><Textarea placeholder="Tell the Parivaar about yourself…" {...field} value={field.value ?? ""} rows={3} /></FormControl><FormMessage /></FormItem>
                          )} />

                          <FormField control={form.control} name="educationType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Education</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-3">
                                  {[
                                    { v: UpdateProfileInputEducationType.SCHOOL, label: "School" },
                                    { v: UpdateProfileInputEducationType.COLLEGE, label: "College" },
                                  ].map(({ v, label }) => (
                                    <label key={v} htmlFor={`d-edu-${v}`} className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                      <RadioGroupItem value={v} id={`d-edu-${v}`} /><span className="font-medium text-sm">{label}</span>
                                    </label>
                                  ))}
                                </RadioGroup>
                              </FormControl><FormMessage />
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="schoolOrCollegeName" render={({ field }) => (
                            <FormItem><FormLabel>{educationType === "SCHOOL" ? "School Name" : "College Name"}</FormLabel><FormControl><Input {...field} className="h-11" /></FormControl><FormMessage /></FormItem>
                          )} />

                          {educationType === "SCHOOL" ? (
                            <FormField control={form.control} name="schoolClass" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Select class" /></SelectTrigger></FormControl>
                                  <SelectContent>{SCHOOL_CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                              </FormItem>
                            )} />
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              <FormField control={form.control} name="degreeLevel" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Degree</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Degree" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      <SelectItem value={UpdateProfileInputDegreeLevel.DIPLOMA}>Diploma</SelectItem>
                                      <SelectItem value={UpdateProfileInputDegreeLevel.BACHELORS}>Bachelor's</SelectItem>
                                      <SelectItem value={UpdateProfileInputDegreeLevel.MASTERS}>Master's</SelectItem>
                                    </SelectContent>
                                  </Select><FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="collegeYear" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl><SelectTrigger className="h-11"><SelectValue placeholder="Year" /></SelectTrigger></FormControl>
                                    <SelectContent>{COLLEGE_YEARS.map(y => <SelectItem key={y} value={y}>{y} Year</SelectItem>)}</SelectContent>
                                  </Select><FormMessage />
                                </FormItem>
                              )} />
                            </div>
                          )}

                          <FormField control={form.control} name="expertiseIds" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills <span className="text-muted-foreground font-normal">(1 to 6)</span></FormLabel>
                              <FormControl><ExpertiseMultiSelect options={expertiseData?.data ?? []} value={field.value} onChange={field.onChange} max={6} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          <DialogFooter>
                            <Button type="submit" disabled={updateMutation.isPending} className="font-semibold">
                              {updateMutation.isPending ? "Saving…" : "Save changes"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <h2 className="font-heading text-2xl font-bold" style={{ color: NAVY }}>{user.name}</h2>
                {user.city && (
                  <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: "#4A5568" }}>
                    <MapPin className="w-4 h-4" style={{ color: TEAL }} /> {user.city}
                  </p>
                )}
                {eduLabel.trim() && (
                  <p className="flex items-center gap-1.5 text-sm mt-1" style={{ color: "#4A5568" }}>
                    <GraduationCap className="w-4 h-4" style={{ color: TEAL }} /> {eduLabel}
                  </p>
                )}

                {user.bio && <p className="text-sm mt-4 leading-relaxed" style={{ color: "#4A5568" }}>{user.bio}</p>}

                <div className="flex flex-col gap-1.5 mt-4 text-sm" style={{ color: "#4A5568" }}>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: TEAL }} /> {user.email}</div>
                  {user.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: TEAL }} /> +91 {user.phone}</div>}
                </div>

                {user.expertise && user.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {user.expertise.map(s => (
                      <span key={s.id} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "rgba(63,167,150,0.1)", color: TEAL }}>{s.name}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-heading text-lg">Availability</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm" style={{ color: NAVY }}>{available ? "Available to connect" : "Not available"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {available ? "Your card shows in full colour." : "Your card shows in grayscale."}
                    </p>
                  </div>
                  <Switch checked={available} onCheckedChange={handleAvailabilityChange} disabled={availabilityMutation.isPending} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-heading text-lg">Discussion Forum</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Community discussions are coming soon. Stay tuned!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

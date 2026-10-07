"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { submitReport } from "../actions/reportActions";
import { Button, Input, Textarea, Select, RadioCards, FileUpload, Card } from "@/components/ui";

// ─── Data ────────────────────────────────────────────────────────────────────
const departments = [
  "Press", "Body 1", "Body 2", "Toso 1", "Toso 2", "Assy 1", "Assy 2", 
  "Log. 1", "Log. 2", "PCD", "GA", "PE", "QI", "QE", "QSS", "R&D", 
  "CIT", "MTNC PW", "MTNC TA", "EA", "HRD", "EID"
];

const departmentOptions = departments.map((d) => ({ value: d, label: d }));

const severityOptions = [
  {
    value: "Rendah",
    label: "Rendah",
    description: "Tidak mengganggu operasional atau keselamatan",
    colorTone: "green" as const,
  },
  {
    value: "Sedang",
    label: "Sedang",
    description: "Perhatian khusus, ada potensi gangguan ringan",
    colorTone: "yellow" as const,
  },
  {
    value: "Tinggi",
    label: "Tinggi",
    description: "Bahaya kritis, butuh penanganan segera",
    colorTone: "red" as const,
  },
];

// ─── Schema Validation (Zod) ─────────────────────────────────────────────────
const formSchema = z.object({
  reporterName: z.string().min(1, { message: "Nama lengkap wajib diisi." }),
  npk: z.string().min(1, { message: "NPK wajib diisi." }),
  department: z.string().min(1, { message: "Silakan pilih departemen." }),
  area: z
    .string()
    .min(3, { message: "Area temuan minimal 3 karakter." })
    .max(150, { message: "Area temuan maksimal 150 karakter." }),
  hazardLevel: z.enum(["Rendah", "Sedang", "Tinggi"], {
    message: "Pilih tingkat bahaya.",
  }),
  description: z
    .string()
    .min(20, { message: "Deskripsi minimal 20 karakter." })
    .max(1000, { message: "Deskripsi maksimal 1000 karakter." }),
  // In a real app we'd validate the actual File objects via Supabase logic
  files: z.custom<File[]>().refine((files) => files && files.length > 0, {
    message: "Minimal unggah 1 foto temuan.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Page Component ──────────────────────────────────────────────────────────
export default function BuatLaporanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporterName: "",
      npk: "",
      department: "",
      area: "",
      hazardLevel: undefined,
      description: "",
      files: [],
    },
  });

  const descriptionValue = useWatch({
    control,
    name: "description",
    defaultValue: "",
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const formData = new FormData();
      formData.append("reporterName", data.reporterName);
      formData.append("npk", data.npk);
      formData.append("department", data.department);
      formData.append("area", data.area);
      formData.append("hazardLevel", data.hazardLevel);
      formData.append("description", data.description);
      
      data.files.forEach((file) => {
        formData.append("files", file);
      });
      
      // Ambil nilai honeypot jika bot mencoba mengisi
      const honeypot = document.getElementById("botField") as HTMLInputElement;
      if (honeypot && honeypot.value) {
        formData.append("botField", honeypot.value);
      }

      const result = await submitReport(formData);

      if (result.success && result.reportNumber) {
        router.push(`/lapor/sukses?id=${result.reportNumber}`);
      } else {
        setSubmitError(result.error || "Gagal mengirim laporan.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-160 mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-text">Buat Laporan Abnormality</h1>
        <p className="mt-2 text-sm text-text-muted">
          Silakan lengkapi form di bawah ini untuk melaporkan temuan abnormality di area fasilitas umum perusahaan.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* 1. Nama Lengkap */}
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap Anda..."
            {...register("reporterName")}
            error={errors.reporterName?.message}
          />

          {/* 2. NPK */}
          <Input
            label="NPK (Nomor Pokok Karyawan)"
            placeholder="Contoh: 12345"
            {...register("npk")}
            error={errors.npk?.message}
          />

          {/* 3. Departemen */}
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                label="Departemen"
                placeholder="Pilih departemen asal Anda..."
                options={departmentOptions}
                error={errors.department?.message}
                {...field}
              />
            )}
          />

          {/* 4. Area Temuan */}
          <Input
            label="Area Temuan"
            placeholder="Contoh: Toilet Gedung A Lt. 2, Area Parkir Motor Timur..."
            {...register("area")}
            error={errors.area?.message}
          />

          {/* 5. Tingkat Bahaya */}
          <Controller
            name="hazardLevel"
            control={control}
            render={({ field }) => (
              <RadioCards
                label="Tingkat Bahaya"
                name="hazardLevel"
                options={severityOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.hazardLevel?.message}
              />
            )}
          />

          {/* 6. Deskripsi */}
          <div className="flex flex-col gap-1.5 w-full">
            <Textarea
              label="Deskripsi Temuan"
              placeholder="Jelaskan secara rinci apa yang terjadi, lokasi spesifik, dan kondisi saat ini..."
              rows={5}
              {...register("description")}
              error={errors.description?.message}
            />
            {/* Penghitung Karakter */}
            <div className="flex justify-between items-center px-1">
              <span className="text-[11px] text-text-muted">
                Jelaskan minimal 20 karakter agar kondisi mudah dipahami.
              </span>
              <span
                className={`text-[11px] font-medium ${
                  descriptionValue.length > 1000
                    ? "text-severity-high"
                    : "text-text-muted"
                }`}
              >
                {descriptionValue.length}/1000
              </span>
            </div>
          </div>

          {/* 7. Foto Temuan */}
          <Controller
            name="files"
            control={control}
            render={({ field }) => (
              <FileUpload
                label="Foto Temuan (Wajib)"
                accept="image/*"
                multiple
                maxSizeMB={5}
                error={errors.files?.message}
                onFilesChange={field.onChange}
              />
            )}
          />

          {/* Honeypot field untuk anti-spam (tersembunyi dari user) */}
          <input
            type="text"
            id="botField"
            name="botField"
            className="hidden"
            autoComplete="off"
            tabIndex={-1}
          />

          {/* Submit Button */}
          <div className="pt-5 border-t border-border mt-2 flex flex-col gap-3">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {submitError}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses Laporan..." : "Kirim Laporan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

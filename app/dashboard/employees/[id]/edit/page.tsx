"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/language-context";

interface Sector {
    id: string;
    name: string;
}

interface Function {
    id: string;
    name: string;
}

interface Employee {
    id: string;
    cin: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    sectorId: string;
    functionId: string;
    dailySalary: number;
    advanceAmount: number;
    joinDate: string;
    employmentStatus: string;
    notes: string;
    profilePhoto: string | null;
    idProofPhotos: string[];
}

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useLanguage();
    const employeeId = params.id as string;

    const [sectors, setSectors] = useState<Sector[]>([]);
    const [functions, setFunctions] = useState<Function[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        cin: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phoneNumber: "",
        address: "",
        sectorId: "",
        functionId: "",
        dailySalary: "",
        advanceAmount: "",
        joinDate: "",
        employmentStatus: "ACTIVE",
        notes: "",
    });

    // File upload states
    const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
    const [existingProfilePhoto, setExistingProfilePhoto] = useState<string>("");
    const [newIdProofFiles, setNewIdProofFiles] = useState<File[]>([]);
    const [newIdProofPreviews, setNewIdProofPreviews] = useState<{ name: string; url: string; type: string }[]>([]);
    const [existingIdProofs, setExistingIdProofs] = useState<string[]>([]);

    const profilePhotoRef = useRef<HTMLInputElement>(null);
    const idProofRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchEmployee();
        fetchSectors();
        fetchFunctions();
    }, []);

    const fetchEmployee = async () => {
        try {
            const response = await fetch(`/api/employees/${employeeId}`);
            const data: Employee = await response.json();

            setFormData({
                cin: data.cin,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth.split("T")[0],
                phoneNumber: data.phoneNumber,
                address: data.address,
                sectorId: data.sectorId,
                functionId: data.functionId,
                dailySalary: data.dailySalary.toString(),
                advanceAmount: data.advanceAmount.toString(),
                joinDate: data.joinDate.split("T")[0],
                employmentStatus: data.employmentStatus,
                notes: data.notes || "",
            });

            if (data.profilePhoto) {
                setExistingProfilePhoto(data.profilePhoto);
                setProfilePhotoPreview(data.profilePhoto);
            }
            if (data.idProofPhotos && data.idProofPhotos.length > 0) {
                setExistingIdProofs(data.idProofPhotos);
            }
        } catch (error) {
            console.error("Failed to fetch employee:", error);
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.toasts.failedLoadEmployee,
            });
        } finally {
            setFetching(false);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await fetch("/api/sectors");
            const data = await response.json();
            setSectors(data);
        } catch (error) {
            console.error("Failed to fetch sectors:", error);
        }
    };

    const fetchFunctions = async () => {
        try {
            const response = await fetch("/api/functions");
            const data = await response.json();
            setFunctions(data);
        } catch (error) {
            console.error("Failed to fetch functions:", error);
        }
    };

    const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: "destructive", title: t.common.error, description: t.employees.maxFileSize });
                return;
            }
            setProfilePhotoFile(file);
            setExistingProfilePhoto("");
            const reader = new FileReader();
            reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: File[] = [];
        const previews: { name: string; url: string; type: string }[] = [];

        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ variant: "destructive", title: t.common.error, description: `${file.name}: ${t.employees.maxFileSize}` });
                continue;
            }
            validFiles.push(file);

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewIdProofPreviews((prev) => [...prev, { name: file.name, url: reader.result as string, type: "image" }]);
                };
                reader.readAsDataURL(file);
            } else {
                previews.push({ name: file.name, url: "", type: "pdf" });
            }
        }

        setNewIdProofFiles((prev) => [...prev, ...validFiles]);
        setNewIdProofPreviews((prev) => [...prev, ...previews]);
    };

    const removeProfilePhoto = () => {
        setProfilePhotoFile(null);
        setProfilePhotoPreview("");
        setExistingProfilePhoto("");
        if (profilePhotoRef.current) profilePhotoRef.current.value = "";
    };

    const removeExistingIdProof = (index: number) => {
        setExistingIdProofs((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewIdProof = (index: number) => {
        setNewIdProofFiles((prev) => prev.filter((_, i) => i !== index));
        setNewIdProofPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async (): Promise<{ profilePhoto?: string; newIdProofPaths: string[] }> => {
        let profilePhoto: string | undefined;
        let newIdProofPaths: string[] = [];

        if (profilePhotoFile) {
            const fd = new FormData();
            fd.append("files", profilePhotoFile);
            fd.append("type", "profiles");
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Failed to upload profile photo");
            const data = await res.json();
            profilePhoto = data.paths[0];
        }

        if (newIdProofFiles.length > 0) {
            const fd = new FormData();
            newIdProofFiles.forEach((file) => fd.append("files", file));
            fd.append("type", "id-proofs");
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            if (!res.ok) throw new Error("Failed to upload ID proof files");
            const data = await res.json();
            newIdProofPaths = data.paths;
        }

        return { profilePhoto, newIdProofPaths };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            setUploading(true);
            const { profilePhoto, newIdProofPaths } = await uploadFiles();
            setUploading(false);

            // Merge existing ID proofs with newly uploaded ones
            const allIdProofPhotos = [...existingIdProofs, ...newIdProofPaths];

            // Determine profile photo: new upload > existing > removed (null)
            const finalProfilePhoto = profilePhoto || existingProfilePhoto || null;

            const response = await fetch(`/api/employees/${employeeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    dailySalary: parseFloat(formData.dailySalary),
                    advanceAmount: parseFloat(formData.advanceAmount),
                    profilePhoto: finalProfilePhoto,
                    idProofPhotos: allIdProofPhotos,
                }),
            });

            if (response.ok) {
                router.push(`/dashboard/employees/${employeeId}`);
            } else {
                const data = await response.json();
                toast({
                    variant: "destructive",
                    title: t.common.error,
                    description: data.error || t.toasts.failedUpdateEmployee,
                });
            }
        } catch (error) {
            console.error("Failed to update employee:", error);
            toast({
                variant: "destructive",
                title: t.common.error,
                description: t.toasts.anErrorOccurred,
            });
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const isImage = (path: string) => /\.(jpg|jpeg|png|webp)$/i.test(path);

    if (fetching) {
        return <div className="p-6">{t.common.loading}</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/employees/${employeeId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{t.employees.editEmployee}</h1>
                    <p className="text-muted-foreground">
                        {t.employees.updateInfo}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{t.employees.personalInfo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Profile Photo */}
                        <div>
                            <Label>{t.employees.profilePhoto}</Label>
                            <div className="mt-2 flex items-start gap-4">
                                {profilePhotoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={profilePhotoPreview}
                                            alt="Profile preview"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-border"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeProfilePhoto}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => profilePhotoRef.current?.click()}
                                        className="w-24 h-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                    >
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground mt-1">{t.employees.uploadPhoto}</span>
                                    </div>
                                )}
                                <input
                                    ref={profilePhotoRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleProfilePhotoChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cin">{t.employees.cin} *</Label>
                                <Input
                                    id="cin"
                                    name="cin"
                                    value={formData.cin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="phoneNumber">{t.employees.phoneNumber} *</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">{t.employees.firstName} *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">{t.employees.lastName} *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="dateOfBirth">{t.employees.dateOfBirth} *</Label>
                            <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">{t.employees.address} *</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Identity Proof Files */}
                        <div>
                            <Label>{t.employees.idProof}</Label>
                            <p className="text-xs text-muted-foreground mb-2">{t.employees.idProofDesc}</p>
                            <div className="space-y-3">
                                {/* Existing ID proof files */}
                                {(existingIdProofs.length > 0 || newIdProofPreviews.length > 0) && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {existingIdProofs.map((path, index) => (
                                            <div key={`existing-${index}`} className="relative group border rounded-lg overflow-hidden">
                                                {isImage(path) ? (
                                                    <img
                                                        src={path}
                                                        alt={`ID Proof ${index + 1}`}
                                                        className="w-full h-32 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-32 flex flex-col items-center justify-center bg-muted">
                                                        <FileText className="h-10 w-10 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground mt-2">PDF</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingIdProof(index)}
                                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* New ID proof files */}
                                        {newIdProofPreviews.map((preview, index) => (
                                            <div key={`new-${index}`} className="relative group border rounded-lg overflow-hidden">
                                                {preview.type === "image" ? (
                                                    <img
                                                        src={preview.url}
                                                        alt={preview.name}
                                                        className="w-full h-32 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-32 flex flex-col items-center justify-center bg-muted">
                                                        <FileText className="h-10 w-10 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground mt-2 px-2 truncate max-w-full">{preview.name}</span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewIdProof(index)}
                                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div
                                    onClick={() => idProofRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground mt-2">{t.employees.uploadIdProof}</span>
                                    <span className="text-xs text-muted-foreground">{t.employees.maxFileSize}</span>
                                </div>
                                <input
                                    ref={idProofRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    multiple
                                    onChange={handleIdProofChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t.employees.employmentDetails}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sectorId">{t.employees.sector} *</Label>
                                <select
                                    id="sectorId"
                                    name="sectorId"
                                    value={formData.sectorId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">{t.employees.selectSector}</option>
                                    {sectors.map((sector) => (
                                        <option key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="functionId">{t.employees.function} *</Label>
                                <select
                                    id="functionId"
                                    name="functionId"
                                    value={formData.functionId}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="">{t.employees.selectFunction}</option>
                                    {functions.map((func) => (
                                        <option key={func.id} value={func.id}>
                                            {func.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dailySalary">{t.employees.dailySalary} *</Label>
                                <Input
                                    id="dailySalary"
                                    name="dailySalary"
                                    type="number"
                                    step="0.01"
                                    value={formData.dailySalary}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="advanceAmount">{t.employees.advanceAmount}</Label>
                                <Input
                                    id="advanceAmount"
                                    name="advanceAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.advanceAmount}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="joinDate">{t.employees.joinDate} *</Label>
                                <Input
                                    id="joinDate"
                                    name="joinDate"
                                    type="date"
                                    value={formData.joinDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="employmentStatus">{t.employees.employmentStatus} *</Label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="ACTIVE">{t.common.active}</option>
                                    <option value="INACTIVE">{t.common.inactive}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">{t.common.notes}</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder={t.employees.additionalNotes}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4 mt-6">
                    <Button type="submit" disabled={loading}>
                        {uploading ? t.employees.uploadingFiles : loading ? t.employees.updating : t.employees.updateEmployee}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        {t.common.cancel}
                    </Button>
                </div>
            </form>
        </div>
    );
}

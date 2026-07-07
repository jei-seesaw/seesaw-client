import { httpClient } from "@/shared/api";
import type { ImageUploadRequest, ImageUploadSignature } from "../model/types";

/** 서버에서 Cloudinary 직접 업로드용 서명값을 발급받는다. */
export function requestImageUploadSignature(body: ImageUploadRequest): Promise<ImageUploadSignature> {
  return httpClient.post<ImageUploadSignature>("/image-uploads", body);
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  url?: string;
}

/**
 * 선택지 이미지 업로드 전체 흐름:
 * 서명 발급 → Cloudinary(uploadUrl)로 직접 업로드 → 업로드된 이미지 URL 반환.
 */
export async function uploadOptionImage(file: File): Promise<string> {
  const signature = await requestImageUploadSignature({
    bytes: file.size,
    contentType: file.type,
    purpose: "vote-event-option",
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(signature.formFields)) {
    form.append(key, String(value));
  }
  form.append("file", file);

  // Cloudinary로 직접 업로드 (우리 서버 아님 → 인증 헤더/엔벨로프 없음)
  const res = await fetch(signature.uploadUrl, { method: "POST", body: form });
  if (!res.ok) {
    throw new Error("이미지 업로드에 실패했습니다.");
  }

  const data = (await res.json()) as CloudinaryUploadResponse;
  const url = data.secure_url ?? data.url;
  if (!url) {
    throw new Error("업로드 URL을 받지 못했습니다.");
  }
  return url;
}

'use client';

export type UploadResult = { status: number; body: string };

/** POSTs FormData with upload progress — fetch() has no upload-progress event, so this uses XHR. */
export function uploadFormData(
  url: string,
  formData: FormData,
  onProgress?: (fraction: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new Error('Network error while uploading.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));
    xhr.send(formData);
  });
}

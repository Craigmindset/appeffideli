"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("File size must be less than 2MB")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    const blob = await put(file.name, file, {
      access: "public",
    })

    revalidatePath("/admin")
    return { url: blob.url }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload image")
  }
}


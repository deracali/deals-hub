import { ForumPost } from "@/types/forum";

/**
 * Resolve a real author photo from various possible keys.
 * Returns undefined when there is no usable image (so UI can show initials).
 */
const resolveAuthorPhoto = (author: any): string | undefined => {
  if (!author) return undefined;
  const candidates = [
    author.photo,
    author.image,
    author.avatar,
    author.picture,
    author.imageUrl,
    author.profilePicture,
  ];

  const raw = candidates.find((c) => c && String(c).trim() !== "");
  if (!raw) return undefined;

  const s = String(raw).trim();

  // filter known placeholder patterns (add more if needed)
  const placeholderPatterns = [
    "pexels.com/photos/220453/pexels-photo-220453.jpeg",
    "example.com/placeholder-image.jpg",
  ];

  if (placeholderPatterns.some((p) => s.includes(p))) return undefined;

  return s;
};

export const fetchForumPosts = async (): Promise<ForumPost[]> => {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${baseURL}/forum/get`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error("Failed to fetch forum posts");

    const json = await res.json();
    const posts = Array.isArray(json?.data) ? json.data : [];

    // Get current logged-in user to compute user-specific flags
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser?._id || currentUser?.id;

    return posts.map((p: any) => {
      const authorRaw = p.author ?? {};
      const photo = resolveAuthorPhoto(authorRaw);

      return {
        id: p._id ?? String(Math.random()),
        title: p.title ?? "",
        content: p.content ?? "",
        type: p.type ?? "general",
        author: {
          name: authorRaw.name ?? "Unknown",
          // only include photo if resolved (so UI will fallback to initials when undefined)
          ...(photo ? { photo } : {}),
          isVerified: authorRaw.isVerified ?? false,
          reputation: authorRaw.reputation ?? 0,
        },
        createdAt: p.createdAt ?? new Date().toISOString(),
        views: p.views ?? 0,
        isPinned: p.isPinned ?? false,
        tags: Array.isArray(p.tags) ? p.tags : p.tags ? [String(p.tags)] : [],
        reportedScamUrl: p.reportedScamUrl ?? undefined,
        relatedDealId: p.relatedDealId ?? undefined,
        comments: Array.isArray(p.comments) ? p.comments : [],

        // likes/dislikes and user-specific flags
        likes: p.likes ?? 0,
        dislikes: p.dislikes ?? 0,
        hasUserLiked:
          Array.isArray(p.hasUserLiked) && userId
            ? p.hasUserLiked.includes(userId)
            : !!p.hasUserLiked,
        hasUserDisliked:
          Array.isArray(p.hasUserDisliked) && userId
            ? p.hasUserDisliked.includes(userId)
            : !!p.hasUserDisliked,
      } as ForumPost;
    });
  } catch (err) {
    console.error("Error fetching forum posts:", err);
    return [];
  }
};

export const createForumPost = async (
  formData: any,
  onSubmit: (post: ForumPost) => void,
  onClose: () => void,
  setIsSubmitting: (v: boolean) => void,
) => {
  try {
    setIsSubmitting(true);

    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) {
      alert("You must be logged in to create a post.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.content || formData.content.trim().length < 20) {
      alert("Post content must be at least 20 characters long.");
      setIsSubmitting(false);
      return;
    }

    // Prefer the correct image key(s) from currentUser (image, photo, avatar, picture)
    const currentUserImage =
      currentUser.image ??
      currentUser.photo ??
      currentUser.avatar ??
      currentUser.picture ??
      currentUser.imageUrl ??
      currentUser.profilePicture;

    // Build author payload but DO NOT include a placeholder
    const authorPayload: any = {
      id: currentUser.id,
      name: currentUser.name,
      isVerified: currentUser.isVerified ?? false,
      reputation: currentUser.reputation ?? 0,
    };
    if (currentUserImage && String(currentUserImage).trim() !== "") {
      // send both keys just in case backend expects either; adjust if backend expects only one
      authorPayload.image = currentUserImage;
      authorPayload.photo = currentUserImage;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forum/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          type: formData.type,
          tags: formData.tags
            ?.split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
          reportedScamUrl:
            formData.type === "scam-report" ? formData.scamUrl : undefined,
          relatedDealId: formData.relatedDealId || undefined,
          author: authorPayload,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      let msg = "Failed to create post.";
      try {
        const parsed = JSON.parse(text);
        msg = parsed.message || msg;
      } catch {
        msg = text;
      }
      alert(msg);
      throw new Error(msg);
    }

    const json = await res.json();

    // Resolve the final author image using server response first, then fallback to currentUserImage
    const serverAuthor = json.data?.author ?? {};
    const resolvedServerPhoto =
      serverAuthor?.photo ??
      serverAuthor?.image ??
      serverAuthor?.avatar ??
      serverAuthor?.picture;
    const resolvedImage = resolvedServerPhoto || currentUserImage;

    // Build the local newPost — only include photo if present and not a known placeholder
    const newPost: ForumPost = {
      id: json.data?._id ?? Date.now().toString(),
      title: json.data?.title ?? formData.title,
      content: json.data?.content ?? formData.content,
      type: json.data?.type ?? formData.type,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        ...(resolvedImage && String(resolvedImage).trim() !== ""
          ? { photo: String(resolvedImage).trim() }
          : {}),
        isVerified: currentUser.isVerified ?? false,
        reputation: currentUser.reputation ?? 0,
      } as any,
      createdAt: json.data?.createdAt ?? new Date().toISOString(),
      views: json.data?.views ?? 0,
      isPinned: json.data?.isPinned ?? false,
      tags:
        json.data?.tags ??
        (formData.tags
          ? formData.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : []),
      reportedScamUrl:
        json.data?.reportedScamUrl ??
        (formData.type === "scam-report" ? formData.scamUrl : undefined),
      relatedDealId:
        (json.data?.relatedDealId ?? formData.relatedDealId) || undefined,
      comments: [],
    };

    onSubmit(newPost);
    onClose();
  } catch (err) {
    console.error("Error creating post:", err);
  } finally {
    setIsSubmitting(false);
  }
};

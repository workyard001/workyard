
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  Home,
  Search,
  BriefcaseBusiness,
  Users,
  MessageCircle,
  Bell,
  UserRound,
  LogOut,
  ImagePlus,
  ThumbsUp,
  MessageSquare,
  Reply,
  Trash2,
  Repeat2,
  BadgeCheck,
  MapPin,
  X,
  Send,
  Plus,
  MoreVertical,
  Flag,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type AccountType = "hirer" | "job_seeker" | "skill_owner";
type PostType = "update" | "job_portfolio" | "work_portfolio";

type FeedMedia = {
  id: string;
  storage_path: string;
  media_type: string;
  alt_text: string | null;
  position: number;
};

type FeedPostRow = {
  id: string;
  author_id: string;
  post_type: PostType;
  content: string;
  job_id: string | null;
  job_title: string | null;
  created_at: string;
  author_name: string;
  author_avatar_path: string | null;
  author_avatar_url: string | null;
  author_account_type: string;
  author_verification_status: string;
  author_location: string | null;
  like_count: number;
  comment_count: number;
  reshare_count: number;
  viewer_has_liked: boolean;
  media: FeedMedia[] | null;
};

type FeedPost = FeedPostRow & {
  viewer_has_reshared: boolean;
};

type FeedComment = {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_path: string | null;
  author_avatar_url: string | null;
  content: string;
  parent_id: string | null;
  created_at: string;
  is_deleted: boolean;
};

type JobOption = {
  id: string;
  title: string;
  status: string;
};

function normalizeAccountType(value: unknown): AccountType | null {
  if (value === "hirer" || value === "client" || value === "recruiter") {
    return "hirer";
  }

  if (value === "job_seeker") return "job_seeker";
  if (value === "skill_owner") return "skill_owner";

  return null;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "W";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function errorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String((error as { message: unknown }).message);
  }

  return "Something went wrong. Please try again.";
}

async function compressImage(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1280;
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const compressed = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image compression failed."));
      },
      "image/webp",
      0.76
    );
  });

  return compressed.size < file.size ? compressed : file;
}

export default function YardHome() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [fullName, setFullName] = useState("WORKYARD Member");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [location, setLocation] = useState("");

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [feedError, setFeedError] = useState("");

  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("update");
  const [ownJobs, setOwnJobs] = useState<JobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [postMessage, setPostMessage] = useState("");
  const [openPostMenu, setOpenPostMenu] = useState<string | null>(null);
  const [postDeleting, setPostDeleting] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState<string | null>(null);

  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyErrors, setReplyErrors] = useState<Record<string, string>>({});
  const [commentDeleting, setCommentDeleting] = useState<string | null>(null);
  const [commentSending, setCommentSending] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<string | null>(null);

  // Read the existing Supabase session and profile.
  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;

        if (!user || !active) {
          if (active) setReady(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "full_name, account_type, avatar_path, location"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;

        setUserId(user.id);
        setFullName(
          profile?.full_name ||
          user.user_metadata?.full_name ||
          "WORKYARD Member"
        );
        setAccountType(normalizeAccountType(profile?.account_type));
        if (profile?.avatar_path) {
          const { data: photo } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(profile.avatar_path, 3600);

          setAvatarUrl(photo?.signedUrl || null);
        } else {
          setAvatarUrl(null);
        }
        setLocation(profile?.location || "");
      } catch {
        if (active) {
          setFeedError("Unable to connect. Check your internet connection.");
        }
      } finally {
        if (active) setReady(true);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  // Load only jobs belonging to the signed-in HIRER.
  useEffect(() => {
    if (!userId || accountType !== "hirer") return;

    let active = true;

    async function loadJobs() {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (active && !error) {
        setOwnJobs((data || []) as JobOption[]);
      }
    }

    void loadJobs();

    return () => {
      active = false;
    };
  }, [userId, accountType]);

  // Fetch one page of posts and their reshare status.
  const loadFeed = useCallback(
    async (cursor: string | null, replace: boolean) => {
      if (!userId) return;

      if (replace) setFeedLoading(true);
      else setMoreLoading(true);

      setFeedError("");

      try {
        const { data, error } = await supabase.rpc("get_yard_feed", {
          p_limit: 10,
          p_before: cursor,
        });

        if (error) throw error;

        const rows = (data || []) as unknown as FeedPostRow[];

        const rowsWithPhotos = await Promise.all(
          rows.map(async (post) => {
            if (!post.author_avatar_path) {
              return { ...post, author_avatar_url: null };
            }

            const { data: photo } = await supabase.storage
              .from("profile-photos")
              .createSignedUrl(post.author_avatar_path, 3600);

            return {
              ...post,
              author_avatar_url: photo?.signedUrl || null,
            };
          })
        );

        const ids = rows.map((post) => post.id);

        let sharedIds = new Set<string>();

        if (ids.length > 0) {
          const { data: shared, error: sharedError } = await supabase
            .from("yard_post_reshares")
            .select("post_id")
            .eq("user_id", userId)
            .in("post_id", ids);

          if (sharedError) throw sharedError;

          sharedIds = new Set(
            (shared || []).map((item: { post_id: string }) => item.post_id)
          );
        }

        const nextPosts: FeedPost[] = rowsWithPhotos.map((post) => ({
          ...post,
          media: Array.isArray(post.media) ? post.media : [],
          viewer_has_reshared: sharedIds.has(post.id),
        }));

        setPosts((previous) => {
          if (replace) return nextPosts;

          const existing = new Set(previous.map((post) => post.id));
          return [
            ...previous,
            ...nextPosts.filter((post) => !existing.has(post.id)),
          ];
        });

        setHasMore(rows.length === 10);
      } catch (error) {
        setFeedError(errorMessage(error));
      } finally {
        setFeedLoading(false);
        setMoreLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (userId) void loadFeed(null, true);
  }, [userId, loadFeed]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFeedError("Choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setFeedError("Choose an image smaller than 12 MB.");
      event.target.value = "";
      return;
    }

    setFeedError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) return;

    const cleanContent = content.trim();

    if (!cleanContent) {
      setFeedError("Write something before publishing your post.");
      return;
    }

    if (postType === "job_portfolio" && !selectedJob) {
      setFeedError("Choose one of your job posts for this portfolio.");
      return;
    }

    if (!accountType) {
      setFeedError("Your account profile is incomplete. Please update your profile.");
      return;
    }

    setPublishing(true);
    setFeedError("");
    setPostMessage("");

    let createdPostId = "";
    let uploadedPath = "";

    try {
      const { data: newPost, error: createError } = await supabase
        .from("yard_posts")
        .insert({
          author_id: userId,
          post_type: postType,
          content: cleanContent,
          job_id: postType === "job_portfolio" ? selectedJob : null,
          status: "published",
        })
        .select("id")
        .single();

      if (createError) throw createError;

      createdPostId = newPost.id;

      if (selectedImage) {
        const blob = await compressImage(selectedImage);

        if (blob.size > 5 * 1024 * 1024) {
          throw new Error(
            "This image is still larger than 5 MB after compression. Choose a smaller image."
          );
        }

        const extension =
          blob.type === "image/webp"
            ? "webp"
            : selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";

        const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension)
          ? extension
          : "jpg";

        uploadedPath =
          `${userId}/${createdPostId}/${Date.now()}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("yard-post-media")
          .upload(uploadedPath, blob, {
            contentType: blob.type || selectedImage.type,
            cacheControl: "31536000",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { error: mediaError } = await supabase
          .from("yard_post_media")
          .insert({
            post_id: createdPostId,
            storage_path: uploadedPath,
            media_type: "image",
            alt_text: selectedImage.name,
            position: 0,
          });

        if (mediaError) throw mediaError;
      }

      setContent("");
      setPostType("update");
      setSelectedJob("");
      setSelectedImage(null);
      setImagePreview("");
      setPostMessage("Your post has been published.");
      await loadFeed(null, true);
    } catch (error) {
      if (uploadedPath) {
        await supabase.storage
          .from("yard-post-media")
          .remove([uploadedPath]);
      }

      if (createdPostId) {
        await supabase
          .from("yard_posts")
          .delete()
          .eq("id", createdPostId);
      }

      setFeedError(errorMessage(error));
    } finally {
      setPublishing(false);
    }
  }

  async function toggleLike(post: FeedPost) {
    if (!userId) return;

    setFeedError("");

    const { error } = post.viewer_has_liked
      ? await supabase
          .from("yard_post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", userId)
      : await supabase
          .from("yard_post_likes")
          .insert({ post_id: post.id, user_id: userId });

    if (error) {
      setFeedError(errorMessage(error));
      return;
    }

    setPosts((previous) =>
      previous.map((item) =>
        item.id === post.id
          ? {
              ...item,
              viewer_has_liked: !item.viewer_has_liked,
              like_count: Math.max(
                0,
                Number(item.like_count) + (item.viewer_has_liked ? -1 : 1)
              ),
            }
          : item
      )
    );
  }

  async function toggleReshare(post: FeedPost) {
    if (!userId) return;

    setFeedError("");

    const { error } = post.viewer_has_reshared
      ? await supabase
          .from("yard_post_reshares")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", userId)
      : await supabase
          .from("yard_post_reshares")
          .insert({ post_id: post.id, user_id: userId });

    if (error) {
      setFeedError(errorMessage(error));
      return;
    }

    setPosts((previous) =>
      previous.map((item) =>
        item.id === post.id
          ? {
              ...item,
              viewer_has_reshared: !item.viewer_has_reshared,
              reshare_count: Math.max(
                0,
                Number(item.reshare_count) +
                  (item.viewer_has_reshared ? -1 : 1)
              ),
            }
          : item
      )
    );
  }

  async function openComments(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }

    setExpandedPost(postId);
    setFeedError("");

    // An empty array is also a completed load.
    if (Object.prototype.hasOwnProperty.call(comments, postId)) {
      return;
    }

    setCommentLoading(postId);

    try {
      const { data, error } = await supabase.rpc(
        "get_yard_post_comments",
        { p_post_id: postId }
      );

      if (error) throw error;

      const commentRows = (data || []) as FeedComment[];

      const commentsWithPhotos = await Promise.all(
        commentRows.map(async (comment) => {
          if (!comment.author_avatar_path) {
            return { ...comment, author_avatar_url: null };
          }

          const { data: photo } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(comment.author_avatar_path, 3600);

          return {
            ...comment,
            author_avatar_url: photo?.signedUrl || null,
          };
        })
      );

      setComments((previous) => ({
        ...previous,
        [postId]: commentsWithPhotos,
      }));
    } catch (error) {
      setFeedError(`Could not load comments: ${errorMessage(error)}`);
    } finally {
      setCommentLoading(null);
    }
  }

  async function deleteComment(postId: string, commentId: string) {
    if (commentDeleting === commentId) return;

    if (!userId) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: "Please sign in before deleting a comment.",
      }));
      return;
    }

    const confirmed = window.confirm(
      "Delete this comment? Any replies will remain visible."
    );

    if (!confirmed) return;

    setCommentDeleting(commentId);
    setCommentErrors((previous) => ({ ...previous, [postId]: "" }));

    try {
      const { error } = await supabase.rpc(
        "delete_yard_post_comment",
        { p_comment_id: commentId }
      );

      if (error) throw error;

      setComments((previous) => ({
        ...previous,
        [postId]: (previous[postId] || [])
          .filter((comment) => comment.id !== commentId)
          .map((comment) =>
            comment.parent_id === commentId
              ? { ...comment, parent_id: null }
              : comment
          ),
      }));

      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                comment_count: Math.max(0, Number(post.comment_count) - 1),
              }
            : post
        )
      );

      setReplyingTo((current) => current === commentId ? null : current);
    } catch (error) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: `Comment could not be deleted: ${errorMessage(error)}`,
      }));
    } finally {
      setCommentDeleting(null);
    }
  }

  async function reportContent(
    targetType: "post" | "comment",
    targetId: string,
    authorId: string
  ) {
    if (!userId) {
      setFeedError("Please sign in before reporting content.");
      return;
    }

    if (authorId === userId) {
      setFeedError("You cannot report your own content.");
      return;
    }

    const reportKey = `${targetType}:${targetId}`;
    if (reportSubmitting === reportKey) return;

    const reasons = [
      "spam",
      "harassment",
      "scam",
      "impersonation",
      "inappropriate_content",
      "unsafe_work",
      "other",
    ];

    const selected = window.prompt(
      "Why are you reporting this content? Enter a number:\n" +
      "1. Spam\n2. Harassment\n3. Scam\n4. Impersonation\n" +
      "5. Inappropriate content\n6. Unsafe work\n7. Other"
    );

    if (selected === null) return;

    const reasonNumber = Number(selected.trim());
    if (!Number.isInteger(reasonNumber) || reasonNumber < 1 || reasonNumber > 7) {
      setFeedError("Invalid report reason. Please try again.");
      return;
    }

    const details = window.prompt(
      "Add more details if necessary (optional). Leave blank if you have nothing to add."
    );

    if (details === null) return;

    setReportSubmitting(reportKey);
    setFeedError("");

    try {
      const { error } = await supabase.rpc("submit_content_report", {
        p_target_type: targetType,
        p_target_id: targetId,
        p_reason: reasons[reasonNumber - 1],
        p_details: details.trim() || null,
      });

      if (error) throw error;

      setFeedError("Report submitted successfully. WORKYARD moderation will review it.");
    } catch (error) {
      const message = errorMessage(error);
      setFeedError(
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("unique")
          ? "You have already submitted an active report for this content."
          : `Report could not be submitted: ${message}`
      );
    } finally {
      setReportSubmitting(null);
    }
  }

  async function sendComment(
    postId: string,
    parentId: string | null = null
  ) {
    if (commentSending === postId) return;

    if (!userId) {
      if (parentId) {
        setReplyErrors((previous) => ({
          ...previous,
          [parentId]: "Please sign in before replying.",
        }));
      } else {
        setCommentErrors((previous) => ({
          ...previous,
          [postId]: "Please sign in before commenting.",
        }));
      }
      return;
    }

    const cleanComment = parentId
      ? (replyDrafts[parentId] || "").trim()
      : (commentDrafts[postId] || "").trim();

    if (!cleanComment) {
      if (parentId) {
        setReplyErrors((previous) => ({
          ...previous,
          [parentId]: "Write a reply before sending.",
        }));
      } else {
        setCommentErrors((previous) => ({
          ...previous,
          [postId]: "Write a comment before sending.",
        }));
      }
      return;
    }

    if (parentId) {
      setReplyErrors((previous) => ({ ...previous, [parentId]: "" }));
    } else {
      setCommentErrors((previous) => ({ ...previous, [postId]: "" }));
    }

    setCommentSending(postId);

    try {
      const { data: savedComment, error } = await supabase
        .from("yard_post_comments")
        .insert({
          post_id: postId,
          author_id: userId,
          content: cleanComment,
          parent_id: parentId,
        })
        .select("id, author_id, content, parent_id, created_at")
        .single();

      if (error) throw error;

      if (!savedComment) {
        throw new Error("The comment was not returned after saving.");
      }

      const newComment: FeedComment = {
        id: savedComment.id,
        author_id: savedComment.author_id,
        author_name: fullName,
        author_avatar_path: null,
        author_avatar_url: avatarUrl,
        content: savedComment.content,
        parent_id: savedComment.parent_id,
        created_at: savedComment.created_at,
        is_deleted: false,
      };

      setComments((previous) => {
        const existing = previous[postId] || [];

        if (existing.some((item) => item.id === newComment.id)) {
          return previous;
        }

        return {
          ...previous,
          [postId]: [...existing, newComment],
        };
      });

      if (parentId) {
        setReplyDrafts((previous) => ({
          ...previous,
          [parentId]: "",
        }));
        setReplyingTo(null);
      } else {
        setCommentDrafts((previous) => ({
          ...previous,
          [postId]: "",
        }));
      }

      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? {
                ...post,
                comment_count: Number(post.comment_count) + 1,
              }
            : post
        )
      );
    } catch (error) {
      const message = `Comment could not be saved: ${errorMessage(error)}`;

      if (parentId) {
        setReplyErrors((previous) => ({
          ...previous,
          [parentId]: message,
        }));
      } else {
        setCommentErrors((previous) => ({
          ...previous,
          [postId]: message,
        }));
      }
    } finally {
      setCommentSending(null);
    }
  }

  async function deletePost(post: FeedPost) {
    if (!userId || postDeleting === post.id) return;

    if (post.author_id !== userId) {
      setFeedError("You can only delete your own posts.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this post permanently? Its comments, replies, likes and reshares will also be deleted."
    );

    if (!confirmed) {
      setOpenPostMenu(null);
      return;
    }

    setPostDeleting(post.id);
    setFeedError("");

    // Keep only image paths belonging to this user's specific post.
    const mediaPaths = (post.media || [])
      .map((media) => media.storage_path)
      .filter((path) =>
        path.startsWith(`${userId}/${post.id}/`)
      );

    try {
      const { data: deletedPost, error: deleteError } = await supabase
        .from("yard_posts")
        .delete()
        .eq("id", post.id)
        .eq("author_id", userId)
        .select("id")
        .maybeSingle();

      if (deleteError) throw deleteError;

      if (!deletedPost) {
        throw new Error(
          "The post was not deleted. Confirm that you created this post."
        );
      }

      // Remove the post and its cached comments immediately.
      setPosts((previous) =>
        previous.filter((item) => item.id !== post.id)
      );

      setComments((previous) => {
        const next = { ...previous };
        delete next[post.id];
        return next;
      });

      if (expandedPost === post.id) setExpandedPost(null);

      setOpenPostMenu(null);
      setReplyingTo(null);

      // Database cascades remove media records, but storage files
      // must be removed separately.
      if (mediaPaths.length > 0) {
        try {
          const { error: storageError } = await supabase.storage
            .from("yard-post-media")
            .remove(mediaPaths);

          if (storageError) {
            setFeedError(
              `Post deleted, but some attached images could not be removed: ${storageError.message}`
            );
          }
        } catch {
          setFeedError(
            "Post deleted, but image cleanup failed. Please contact support."
          );
        }
      }
    } catch (error) {
      setFeedError(`Could not delete post: ${errorMessage(error)}`);
    } finally {
      setPostDeleting(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserId(null);
    setAccountType(null);
    setPosts([]);
    setReady(true);
  }

  function renderAvatar(url: string | null, name: string, small = false) {
    return (
      <span className={`wy-avatar${small ? " wy-avatar-small" : ""}`}>
        {url ? (
          <img src={url} alt="" />
        ) : (
          initials(name)
        )}
      </span>
    );
  }

  if (!ready) {
    return (
      <main className="wy-loading">
        <span className="wy-loader" />
        <p>Opening your yard...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="wy-guest">
        <header className="wy-topbar">
          <Link href="/" className="wy-brand">
            <span className="wy-brand-mark">W</span>
            WORK<span>YARD</span>
          </Link>
          <div className="wy-guest-actions">
            <Link href="/login/" className="wy-text-link">Log in</Link>
            <Link href="/signup/" className="wy-primary-button">Join WORKYARD</Link>
          </div>
        </header>

        <section className="wy-guest-hero">
          <div className="wy-eyebrow">LOCAL WORK. REAL TRUST.</div>
          <h1>Your community is full of <span>opportunity.</span></h1>
          <p>
            Find local jobs, connect with skilled people, showcase your work
            and build a trusted reputation right in your yard.
          </p>
          <div className="wy-guest-actions">
            <Link href="/signup/" className="wy-primary-button">
              Get started
            </Link>
            <Link href="/login/" className="wy-secondary-button">
              Log in
            </Link>
          </div>
          <div className="wy-guest-points">
            <span><BriefcaseBusiness size={17} /> Local opportunities</span>
            <span><BadgeCheck size={17} /> Trust and verification</span>
            <span><Users size={17} /> Community connections</span>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="wy-app">
      <header className="wy-topbar">
        <Link href="/" className="wy-brand">
          <span className="wy-brand-mark">W</span>
          WORK<span>YARD</span>
        </Link>

        <Link href="/workers/" className="wy-search-link">
          <Search size={17} />
          <span>Find people, skills and services</span>
        </Link>

        <div className="wy-top-actions">
          <Link href="/dashboard/" className="wy-top-icon" aria-label="Dashboard">
            <BriefcaseBusiness size={20} />
          </Link>
          <Link href="/notifications/" className="wy-top-icon" aria-label="Notifications">
            <Bell size={20} />
          </Link>
          <Link href="/profile/" className="wy-top-profile">
            {renderAvatar(avatarUrl, fullName, true)}
            <span>{fullName.split(" ")[0]}</span>
          </Link>
          <button
            className="wy-top-icon"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>

      <div className="wy-layout">
        <aside className="wy-left-sidebar">
          <div className="wy-profile-card">
            {renderAvatar(avatarUrl, fullName)}
            <strong>{fullName}</strong>
            <span className="wy-account-label">
              {accountType?.replace("_", " ") || "WORKYARD member"}
            </span>
            {location && (
              <span className="wy-location">
                <MapPin size={13} /> {location}
              </span>
            )}
            <Link href="/profile/">View profile</Link>
          </div>

          <nav className="wy-side-nav" aria-label="Main navigation">
            <Link className="active" href="/"><Home size={19} /> Home feed</Link>
            <Link href="/jobs/"><BriefcaseBusiness size={19} /> Find work</Link>
            <Link href="/workers/"><Users size={19} /> Find people</Link>
            <Link href="/messages/"><MessageCircle size={19} /> Messages</Link>
            <Link href="/notifications/"><Bell size={19} /> Notifications</Link>
            <Link href="/dashboard/"><UserRound size={19} /> My dashboard</Link>
          </nav>

          <div className="wy-sidebar-note">
            <strong>WORKYARD</strong>
            <p>From finding work to finding everything in your yard.</p>
          </div>
        </aside>

        <section className="wy-feed-column">
          <div className="wy-feed-heading">
            <div>
              <div className="wy-eyebrow">YOUR COMMUNITY</div>
              <h1>Home feed</h1>
              <p>Discover opportunities and updates from your yard.</p>
            </div>
            <Link href="/dashboard/" className="wy-dashboard-link">
              Dashboard
            </Link>
          </div>

          {feedError && (
            <div className="wy-message wy-error">
              {feedError}
              <button onClick={() => setFeedError("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )}

          {postMessage && (
            <div className="wy-message wy-success">
              {postMessage}
              <button onClick={() => setPostMessage("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )}

          <form className="wy-composer" onSubmit={handlePublish}>
            <div className="wy-composer-top">
              {renderAvatar(avatarUrl, fullName)}
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Share an opportunity, your work or an update with your yard..."
                maxLength={5000}
                rows={3}
                aria-label="Write a post"
              />
            </div>

            <div className="wy-composer-options">
              <select
                value={postType}
                onChange={(event) => {
                  setPostType(event.target.value as PostType);
                  setSelectedJob("");
                }}
                aria-label="Post type"
              >
                <option value="update">Community update</option>
                {accountType === "hirer" && (
                  <option value="job_portfolio">Job portfolio</option>
                )}
                {(accountType === "skill_owner" ||
                  accountType === "job_seeker") && (
                  <option value="work_portfolio">Work portfolio</option>
                )}
              </select>

              <label className="wy-image-picker">
                <ImagePlus size={17} />
                <span>Add photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>

              <span className="wy-character-count">
                {content.length}/5000
              </span>
            </div>

            {postType === "job_portfolio" && (
              <div className="wy-job-select">
                <label htmlFor="wy-job-select">Choose your job post</label>
                <select
                  id="wy-job-select"
                  value={selectedJob}
                  onChange={(event) => setSelectedJob(event.target.value)}
                >
                  <option value="">Select one of your jobs</option>
                  {ownJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                {ownJobs.length === 0 && (
                  <p>
                    You haven't posted a job yet.{" "}
                    <Link href="/jobs/new/">Create a job first.</Link>
                  </p>
                )}
              </div>
            )}

            {imagePreview && (
              <div className="wy-image-preview">
                <img src={imagePreview} alt="Selected post preview" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                  }}
                  aria-label="Remove selected image"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <div className="wy-publish-row">
              <span>Share something useful with your community.</span>
              <button
                className="wy-primary-button"
                type="submit"
                disabled={publishing || !content.trim()}
              >
                <Plus size={16} />
                {publishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>

          {feedLoading ? (
            <div className="wy-feed-placeholder">
              <span className="wy-loader" />
              Loading community posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="wy-empty-feed">
              <div className="wy-empty-icon"><Users size={25} /></div>
              <h2>Your yard starts here.</h2>
              <p>
                There are no posts in your feed yet. Share the first update,
                portfolio or opportunity with your community.
              </p>
            </div>
          ) : (
            <div className="wy-post-list">
              {posts.map((post) => (
                <article className="wy-post-card" key={post.id}>
                  <div className="wy-post-author">
                    {renderAvatar(post.author_avatar_url, post.author_name)}
                    <div className="wy-post-author-copy">
                      <strong>{post.author_name}</strong>
                      <span>
                        {post.author_account_type?.replace("_", " ")}
                        {post.author_verification_status === "approved" && (
                          <span className="wy-verified">
                            <BadgeCheck size={13} /> Verified
                          </span>
                        )}
                      </span>
                      <small>
                        {post.author_location
                          ? `${post.author_location} · `
                          : ""}
                        {formatDate(post.created_at)}
                      </small>
                    </div>
                    <span className="wy-post-type">
                      {post.post_type === "job_portfolio"
                        ? "Job portfolio"
                        : post.post_type === "work_portfolio"
                          ? "Work portfolio"
                          : "Community update"}
                    </span>

                    {post.author_id === userId && (
                      <div style={{ position: "relative", marginLeft: "auto" }}>
                        <button
                          type="button"
                          aria-label="Post options"
                          aria-haspopup="menu"
                          aria-expanded={openPostMenu === post.id}
                          onClick={() =>
                            setOpenPostMenu((current) =>
                              current === post.id ? null : post.id
                            )
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "50%",
                            background: "#ffffff",
                            color: "#374151",
                            cursor: "pointer",
                          }}
                        >
                          <MoreVertical size={19} />
                        </button>

                        {openPostMenu === post.id && (
                          <div
                            role="menu"
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "40px",
                              zIndex: 30,
                              minWidth: "165px",
                              padding: "6px",
                              background: "#ffffff",
                              border: "1px solid #e5e7eb",
                              borderRadius: "10px",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            }}
                          >
                            <button
                              type="button"
                              role="menuitem"
                              disabled={postDeleting === post.id}
                              onClick={() => void deletePost(post)}
                              style={{
                                display: "flex",
                                width: "100%",
                                alignItems: "center",
                                gap: "9px",
                                padding: "10px",
                                border: 0,
                                borderRadius: "7px",
                                background: "transparent",
                                color: "#B42318",
                                fontWeight: 700,
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={17} />
                              {postDeleting === post.id
                                ? "Deleting..."
                                : "Delete post"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="wy-post-content">{post.content}</p>

                  {post.job_title && (
                    <div className="wy-linked-job">
                      <BriefcaseBusiness size={17} />
                      <div>
                        <small>Related job</small>
                        <strong>{post.job_title}</strong>
                      </div>
                    </div>
                  )}

                  {post.media?.map((media) => {
                    const imageUrl = supabase.storage
                      .from("yard-post-media")
                      .getPublicUrl(media.storage_path).data.publicUrl;

                    return (
                      <img
                        className="wy-post-image"
                        key={media.id}
                        src={imageUrl}
                        alt={media.alt_text || "WORKYARD community post"}
                        loading="lazy"
                        decoding="async"
                      />
                    );
                  })}

                  <div className="wy-post-counts">
                    <span>{post.like_count} likes</span>
                    <span>
                      {post.comment_count} comments · {post.reshare_count} reshares
                    </span>
                  </div>

                  <div className="wy-post-actions">
                    <button type="button"
                      className={post.viewer_has_liked ? "selected" : ""}
                      onClick={() => void toggleLike(post)}
                    >
                      <ThumbsUp size={17} />
                      Like
                    </button>
                    <button type="button" onClick={() => void openComments(post.id)}>
                      <MessageSquare size={17} />
                      Comment
                    </button>
                    <button type="button"
                      className={post.viewer_has_reshared ? "selected" : ""}
                      onClick={() => void toggleReshare(post)}
                    >
                      <Repeat2 size={17} />
                      {post.viewer_has_reshared ? "Shared" : "Reshare"}
                    </button>
                    {userId && post.author_id !== userId && (
                      <button
                        type="button"
                        disabled={reportSubmitting === `post:${post.id}`}
                        onClick={() =>
                          void reportContent("post", post.id, post.author_id)
                        }
                      >
                        <Flag size={17} />
                        {reportSubmitting === `post:${post.id}` ? "Reporting..." : "Report"}
                      </button>
                    )}
                  </div>

                  {expandedPost === post.id && (
                    <div className="wy-comments">
                      {commentLoading === post.id ? (
                        <p className="wy-comments-loading">Loading comments...</p>
                      ) : (
                        <>
                          {(comments[post.id] || [])
                            .filter((comment) => comment.parent_id === null)
                            .map((comment) => {
                              const replies = (comments[post.id] || []).filter(
                                (reply) => reply.parent_id === comment.id
                              );

                              const canDeleteComment =
                                comment.author_id === userId ||
                                post.author_id === userId;

                              return (
                                <div className="wy-comment-thread" key={comment.id}>
                                  <div className="wy-comment">
                                    {renderAvatar(
                                      comment.author_avatar_url,
                                      comment.author_name,
                                      true
                                    )}

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <strong>{comment.author_name}</strong>
                                      <p>{comment.content}</p>
                                      <small>{formatDate(comment.created_at)}</small>

                                      {!comment.is_deleted && (
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "14px",
                                            flexWrap: "wrap",
                                            marginTop: "7px",
                                          }}
                                        >
                                          {userId && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setReplyingTo(
                                                  replyingTo === comment.id
                                                    ? null
                                                    : comment.id
                                                );
                                                setReplyErrors((previous) => ({
                                                  ...previous,
                                                  [comment.id]: "",
                                                }));
                                              }}
                                              style={{
                                                border: 0,
                                                background: "none",
                                                color: "#0B7A42",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontWeight: 700,
                                              }}
                                            >
                                              <Reply size={14} style={{ verticalAlign: "middle" }} /> Reply
                                            </button>
                                          )}

                                          {userId && comment.author_id !== userId && (
                                            <button
                                              type="button"
                                              disabled={reportSubmitting === `comment:${comment.id}`}
                                              onClick={() =>
                                                void reportContent("comment", comment.id, comment.author_id)
                                              }
                                              style={{
                                                border: 0,
                                                background: "none",
                                                color: "#B42318",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontWeight: 700,
                                              }}
                                            >
                                              <Flag size={14} style={{ verticalAlign: "middle" }} />{" "}
                                              {reportSubmitting === `comment:${comment.id}` ? "Reporting..." : "Report"}
                                            </button>
                                          )}

                                          {canDeleteComment && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void deleteComment(post.id, comment.id)
                                              }
                                              disabled={commentDeleting === comment.id}
                                              style={{
                                                border: 0,
                                                background: "none",
                                                color: "#B42318",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontWeight: 700,
                                              }}
                                            >
                                              <Trash2 size={14} style={{ verticalAlign: "middle" }} />{" "}
                                              {commentDeleting === comment.id
                                                ? "Deleting..."
                                                : "Delete"}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {replies.map((reply) => {
                                    const canDeleteReply =
                                      reply.author_id === userId ||
                                      post.author_id === userId;

                                    return (
                                      <div
                                        className="wy-comment wy-comment-reply"
                                        key={reply.id}
                                        style={{ marginLeft: "38px", marginTop: "10px" }}
                                      >
                                        {renderAvatar(
                                          reply.author_avatar_url,
                                          reply.author_name,
                                          true
                                        )}

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <strong>{reply.author_name}</strong>
                                          <p>{reply.content}</p>
                                          <small>{formatDate(reply.created_at)}</small>

                                          {!reply.is_deleted && userId && reply.author_id !== userId && (
                                            <button
                                              type="button"
                                              disabled={reportSubmitting === `comment:${reply.id}`}
                                              onClick={() =>
                                                void reportContent("comment", reply.id, reply.author_id)
                                              }
                                              style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                marginTop: "7px",
                                                marginRight: "12px",
                                                border: 0,
                                                background: "none",
                                                color: "#B42318",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontWeight: 700,
                                              }}
                                            >
                                              <Flag size={14} />
                                              {reportSubmitting === `comment:${reply.id}` ? "Reporting..." : "Report"}
                                            </button>
                                          )}

                                          {!reply.is_deleted && canDeleteReply && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void deleteComment(post.id, reply.id)
                                              }
                                              disabled={commentDeleting === reply.id}
                                              style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                marginTop: "7px",
                                                border: 0,
                                                background: "none",
                                                color: "#B42318",
                                                padding: 0,
                                                cursor: "pointer",
                                                fontWeight: 700,
                                              }}
                                            >
                                              <Trash2 size={14} />
                                              {commentDeleting === reply.id
                                                ? "Deleting..."
                                                : "Delete"}
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {replyingTo === comment.id && !comment.is_deleted && (
                                    <form
                                      className="wy-comment-form"
                                      style={{ marginLeft: "38px", marginTop: "10px" }}
                                      onSubmit={(event) => {
                                        event.preventDefault();
                                        void sendComment(post.id, comment.id);
                                      }}
                                    >
                                      <input
                                        value={replyDrafts[comment.id] || ""}
                                        onChange={(event) =>
                                          setReplyDrafts((previous) => ({
                                            ...previous,
                                            [comment.id]: event.target.value,
                                          }))
                                        }
                                        placeholder={`Reply to ${comment.author_name}...`}
                                        maxLength={1500}
                                        aria-label="Write a reply"
                                      />
                                      <button
                                        type="submit"
                                        disabled={
                                          commentSending === post.id ||
                                          !(replyDrafts[comment.id] || "").trim()
                                        }
                                        aria-label="Send reply"
                                      >
                                        <Send size={17} />
                                      </button>
                                    </form>
                                  )}

                                  {replyErrors[comment.id] && (
                                    <div
                                      className="wy-message wy-error"
                                      role="alert"
                                      style={{ marginLeft: "38px", marginTop: "8px" }}
                                    >
                                      {replyErrors[comment.id]}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          {(comments[post.id] || []).length === 0 && (
                            <p className="wy-comments-loading">
                              No comments yet. Start the conversation.
                            </p>
                          )}
                        </>
                      )}

                      <form
                        className="wy-comment-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void sendComment(post.id);
                        }}
                      >
                        <input
                          value={commentDrafts[post.id] || ""}
                          onChange={(event) =>
                            setCommentDrafts((previous) => ({
                              ...previous,
                              [post.id]: event.target.value,
                            }))
                          }
                          placeholder="Write a comment..."
                          maxLength={1500}
                          aria-label="Write a comment"
                        />
                        <button
                          type="submit"
                          disabled={
                            commentSending === post.id ||
                            !(commentDrafts[post.id] || "").trim()
                          }
                          aria-label="Send comment"
                        >
                          <Send size={17} />
                        </button>
                      </form>

                      {commentErrors[post.id] && (
                        <div className="wy-message wy-error" role="alert">
                          {commentErrors[post.id]}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {!feedLoading && hasMore && (
            <button
              className="wy-load-more"
              onClick={() => {
                const cursor = posts[posts.length - 1]?.created_at;
                if (cursor) void loadFeed(cursor, false);
              }}
              disabled={moreLoading}
            >
              {moreLoading ? "Loading..." : "Load more posts"}
            </button>
          )}
        </section>

        <aside className="wy-right-sidebar">
          <div className="wy-side-panel">
            <div className="wy-panel-heading">Your WORKYARD</div>
            <h3>Opportunity starts nearby.</h3>
            <p>
              Find jobs, meet trusted workers and build your reputation in
              your own community.
            </p>
            <Link href="/jobs/" className="wy-panel-link">
              Explore local jobs
            </Link>
          </div>

          <div className="wy-side-panel wy-create-panel">
            <div className="wy-panel-heading">QUICK ACCESS</div>
            <Link href="/jobs/new/">
              <Plus size={17} /> Post a job
            </Link>
            <Link href="/workers/">
              <Search size={17} /> Find a worker
            </Link>
            <Link href="/messages/">
              <MessageCircle size={17} /> Open messages
            </Link>
            <Link href="/dashboard/">
              <UserRound size={17} /> Account dashboard
            </Link>
          </div>

          <div className="wy-side-footer">
            WORKYARD · Local skills. Shared trust. More opportunity.
          </div>
        </aside>
      </div>

      <nav className="wy-mobile-nav" aria-label="Mobile navigation">
        <Link href="/" className="active"><Home size={20} /><span>Home</span></Link>
        <Link href="/jobs/"><BriefcaseBusiness size={20} /><span>Jobs</span></Link>
        <Link href="/workers/"><Search size={20} /><span>Discover</span></Link>
        <Link href="/messages/"><MessageCircle size={20} /><span>Messages</span></Link>
        <Link href="/profile/"><UserRound size={20} /><span>Profile</span></Link>
      </nav>
    </main>
  );
}

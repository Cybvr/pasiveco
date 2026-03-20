"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, ExternalLink, Package, Menu, Share2, Plus, Pencil, Check, Trash2, X, Loader2 } from "lucide-react";
import { getUser, updateUser, type User as AppUser } from "@/services/userService";
import { getUserProducts, type Product } from "@/services/productsService";
import { getProductTypeLabel } from "@/lib/productTypes";
import { useAuth } from "@/hooks/useAuth";
import ShareModal from "@/app/common/dashboard/ShareModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function Page() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const [profileData, setProfileData] = useState<
    Partial<AppUser> & {
      username: string;
      slug: string;
      displayName: string;
      bio: string;
      profilePicture: string | null;
      bannerImage: string | null;
    }
  >({
    username: "username",
    displayName: "Your Name",
    bio: "Your bio here",
    profilePicture: "/images/dud.png" as string | null,
    bannerImage: null,
    slug: "username",
  });
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${profileData.username}`
      : `https://pasive.co/${profileData.username}`;

  useEffect(() => {
    const handleSaveRequest = () => { void saveProfile(); };
    window.addEventListener("dashboard:save-edit-profile", handleSaveRequest as EventListener);
    return () => { window.removeEventListener("dashboard:save-edit-profile", handleSaveRequest as EventListener); };
  }, [userProfile, profileData, links, socialLinks]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let profile = await getUser(user.uid);
        if (!profile) {
          const defaultLinks = [
            { id: "1", title: "My Portfolio", description: "Check out my latest work", url: "https://example.com", thumbnail: "/images/pages/website.svg", active: true, clicks: 0, ctr: 0, type: "custom" },
            { id: "2", title: "Personal Website", description: "Visit my home on the web", url: "https://example.com", thumbnail: "/images/pages/website.svg", active: true, clicks: 0, ctr: 0, type: "custom" },
            { id: "3", title: "Contact Me", description: "Reach out for collaborations", url: "mailto:hello@pasive.co", thumbnail: "/images/pages/website.svg", active: true, clicks: 0, ctr: 0, type: "custom" },
          ];
          const defaultSocialLinks = [
            { id: "1", platform: "Instagram", url: "https://instagram.com/username", thumbnail: "/images/pages/instagram.svg", active: true },
            { id: "2", platform: "Twitter", url: "https://twitter.com/username", thumbnail: "/images/pages/twitter.svg", active: true },
            { id: "3", platform: "YouTube", url: "", thumbnail: "/images/pages/youtube.svg", active: false },
            { id: "4", platform: "LinkedIn", url: "https://linkedin.com/in/username", thumbnail: "/images/pages/linkedin.svg", active: true },
            { id: "5", platform: "Facebook", url: "", thumbnail: "/images/pages/facebook.svg", active: false },
            { id: "6", platform: "TikTok", url: "", thumbnail: "/images/pages/tik-tok.svg", active: false },
            { id: "7", platform: "Spotify", url: "", thumbnail: "/images/pages/spotify.svg", active: false },
            { id: "8", platform: "Discord", url: "", thumbnail: "/images/pages/discord.svg", active: false },
          ];
          await updateUser(user.uid, {
            userId: user.uid,
            username: user.email?.split("@")[0] || "user",
            displayName: user.displayName || "Your Name",
            bio: "Building something amazing ✨",
            profilePicture: user.photoURL || "/images/dud.png",
            links: defaultLinks,
            socialLinks: defaultSocialLinks,
            slug: user.email?.split("@")[0] || "user",
          });
          profile = await getUser(user.uid);
        }
        if (profile) {
          setUserProfile(profile);
          setProfileData((prev) => ({
            ...prev,
            username: profile.username || "user",
            displayName: profile.displayName || "Your Name",
            bio: profile.bio || "Building something amazing ✨",
            profilePicture: profile.profilePicture || "/images/dud.png",
            bannerImage: profile.bannerImage || null,
            slug: profile.slug || profile.username || "user",
          }));

          const defaultLinks = [
            { id: "1", title: "My Portfolio", description: "Check out my latest work", url: "https://github.com", thumbnail: "/images/pages/website.svg", active: true, clicks: 0, ctr: 0, type: "custom" },
            { id: "2", title: "Personal Website", description: "Visit my home on the web", url: "https://example.com", thumbnail: "/images/pages/website.svg", active: true, clicks: 0, ctr: 0, type: "custom" },
          ];
          const defaultSocials = [
            { id: "1", platform: "Instagram", url: "https://instagram.com/username", thumbnail: "/images/pages/instagram.svg", active: true },
            { id: "2", platform: "Twitter", url: "https://twitter.com/username", thumbnail: "/images/pages/twitter.svg", active: true },
            { id: "3", platform: "LinkedIn", url: "https://linkedin.com/in/username", thumbnail: "/images/pages/linkedin.svg", active: true },
            { id: "4", platform: "YouTube", url: "", thumbnail: "/images/pages/youtube.svg", active: false },
            { id: "5", platform: "Facebook", url: "", thumbnail: "/images/pages/facebook.svg", active: false },
            { id: "6", platform: "TikTok", url: "", thumbnail: "/images/pages/tik-tok.svg", active: false },
            { id: "7", platform: "Spotify", url: "", thumbnail: "/images/pages/spotify.svg", active: false },
            { id: "8", platform: "Discord", url: "", thumbnail: "/images/pages/discord.svg", active: false },
          ];

          setLinks(!profile.links || profile.links.length === 0 ? defaultLinks : profile.links);

          const hasActiveSocials = profile.socialLinks?.some((s) => s.active && s.url);
          setSocialLinks(!profile.socialLinks || profile.socialLinks.length === 0 || !hasActiveSocials ? defaultSocials : profile.socialLinks);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!user?.uid) return;
      setLoadingProducts(true);
      try {
        const userProducts = await getUserProducts(user.uid);
        setProducts(userProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, [user]);

  const saveProfile = async () => {
    if (!user || !userProfile) return;
    try {
      await updateUser(userProfile.id!, {
        username: profileData.username,
        displayName: profileData.displayName,
        bio: profileData.bio,
        profilePicture: profileData.profilePicture,
        bannerImage: profileData.bannerImage,
        links,
        socialLinks,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setProfileData((prev) => ({ ...prev, profilePicture: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setProfileData((prev) => ({ ...prev, bannerImage: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    setLinks((prev) => [...prev, {
      id: Date.now().toString(),
      title: "New Link",
      description: "",
      url: "https://example.com",
      thumbnail: "/images/pages/website.svg",
      active: true,
      clicks: 0,
      ctr: 0,
      type: "custom",
    }]);
  };

  const handleEditLink = (link: any) => {
    setEditingLinkId(link.id);
    setEditTitle(link.title || "");
    setEditUrl(link.url || "");
  };

  const handleSaveLink = (linkId: string) => {
    setLinks((prev) => prev.map((link) => link.id === linkId ? { ...link, title: editTitle, url: editUrl } : link));
    setEditingLinkId(null);
    setEditTitle("");
    setEditUrl("");
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const handleToggleLink = (linkId: string) => {
    setLinks((prev) => prev.map((link) => link.id === linkId ? { ...link, active: !link.active } : link));
  };

  const handleSocialLinkChange = (socialId: string, updates: { url?: string; active?: boolean }) => {
    setSocialLinks((prev) => prev.map((social) => social.id === socialId ? { ...social, ...updates } : social));
  };

  const handleAddSocialPlatform = (socialId: string) => {
    setSocialLinks((prev) => prev.map((social) => social.id === socialId ? { ...social, active: true } : social));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeProducts = products.filter((product) => product.status === "active");
  const iconColor = profileData.bannerImage ? "text-white drop-shadow-md" : "text-muted-foreground";

  return (
    <div className="mx-auto w-full max-w-sm px-4 pb-24 pt-6 sm:px-0 sm:pb-6">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit profile">
              <Menu className={`h-4 w-4 ${iconColor}`} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Banner</label>
                <div className="relative">
                  <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {profileData.bannerImage
                      ? <img src={profileData.bannerImage} alt="Banner" className="h-full w-full object-cover" />
                      : <span className="text-xs text-muted-foreground">Click to upload</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Profile picture</label>
                <div className="relative h-16 w-16">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-muted">
                    {profileData.profilePicture
                      ? <img src={profileData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                      : <UserIcon className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="absolute inset-0 cursor-pointer opacity-0" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Display name</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, displayName: e.target.value }))}
                  className="w-full rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsShareModalOpen(true)} aria-label="Share">
            <Share2 className={`h-4 w-4 ${iconColor}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(profileUrl, "_blank")} aria-label="View public page">
            <ExternalLink className={`h-4 w-4 ${iconColor}`} />
          </Button>
        </div>
      </div>

      {/* Banner */}
      {profileData.bannerImage && (
        <div className="relative mb-4 h-32 w-full overflow-hidden rounded-xl">
          <img src={profileData.bannerImage} alt="Banner" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        </div>
      )}

      {/* Avatar + identity */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full bg-muted">
          {profileData.profilePicture
            ? <img src={profileData.profilePicture} alt="Profile" className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center"><UserIcon className="h-7 w-7 text-muted-foreground" /></div>}
        </div>
        <h2 className="text-lg font-semibold">
          @{profileData.username?.startsWith("@") ? profileData.username.substring(1) : profileData.username}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{profileData.bio}</p>

        {/* Social icons */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {socialLinks.filter((l) => l.active).map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted/50"
            >
              <img src={social.thumbnail || "/images/pages/website.svg"} alt={social.platform} className="h-4 w-4 object-contain" />
            </a>
          ))}
          <Dialog open={isSocialModalOpen} onOpenChange={setIsSocialModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Edit social links">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Social links</DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-3 overflow-auto pr-1">
                {socialLinks.map((social) => (
                  <div key={social.id} className="space-y-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <img src={social.thumbnail} alt={social.platform} className="h-4 w-4 object-contain" />
                        <span className="text-sm font-medium">{social.platform}</span>
                      </div>
                      {social.active ? (
                        <Button variant="ghost" size="sm" onClick={() => handleSocialLinkChange(social.id, { active: false })}>
                          <X className="h-3.5 w-3.5 mr-1" /> Remove
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleAddSocialPlatform(social.id)}>
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add
                        </Button>
                      )}
                    </div>
                    <input
                      value={social.url || ""}
                      onChange={(e) => handleSocialLinkChange(social.id, { url: e.target.value })}
                      disabled={!social.active}
                      placeholder={`${social.platform} URL`}
                      className="w-full rounded-md border px-2 py-1.5 text-sm disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="links" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl border bg-muted/30 p-1">
          <TabsTrigger value="links" className="rounded-lg px-3 py-2 text-sm font-medium">
            Links ({links.length})
          </TabsTrigger>
          <TabsTrigger value="products" className="rounded-lg px-3 py-2 text-sm font-medium">
            Products ({activeProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="mt-0 space-y-2">
          {links.map((link) => (
            <div key={link.id} className="w-full rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50">
              {editingLinkId === link.id ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    placeholder="Link title"
                  />
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full rounded-md border px-2 py-1 text-sm"
                    placeholder="https://example.com"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingLinkId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => handleSaveLink(link.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <img
                      src={link.thumbnail}
                      alt={link.title}
                      className="h-4 w-4 shrink-0 object-contain"
                      onError={(e) => { e.currentTarget.src = "/images/pages/website.svg"; }}
                    />
                    <span className="truncate font-medium">{link.title}</span>
                  </a>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button variant="ghost" size="sm" className="px-1.5 text-[10px] font-semibold" onClick={() => handleToggleLink(link.id)}>
                      {link.active ? "ON" : "OFF"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditLink(link)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteLink(link.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed" onClick={handleAddLink}>
            <Plus className="h-4 w-4 mr-1.5" /> Add link
          </Button>
        </TabsContent>

        <TabsContent value="products" className="mt-0 space-y-3">
          {loadingProducts ? (
            <div className="flex justify-center rounded-lg border py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : activeProducts.length > 0 ? (
            activeProducts.map((product) => (
              <div key={product.id}>
                <a
                  href={`/${profileData.username}/product/${product.id}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {product.thumbnail
                        ? <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                        : <Package className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <span className="shrink-0 text-sm font-semibold">
                          {product.currency === "USD" ? "$" : product.currency}{product.price}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">{getProductTypeLabel(product.category)}</p>
                    </div>
                  </div>
                </a>
                {product.url && (
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 block">
                    <Button className="w-full">Buy Now</Button>
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No active products yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add products from your products dashboard to feature them here.</p>
              <Button asChild variant="outline" className="mt-4">
                <a href="/dashboard/products">Manage products</a>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </div>
  );
}

export default Page;
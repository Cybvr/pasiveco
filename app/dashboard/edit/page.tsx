"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, ExternalLink, Package, Menu, Share2, Plus, Pencil, Check, Trash2, X } from "lucide-react";
import { getUser, updateUser, type User as AppUser } from "@/services/userService";
import { getUserProducts, type Product } from "@/services/productsService";
import { useAuth } from "@/hooks/useAuth";
import ShareModal from "@/app/common/dashboard/ShareModal";
import Watermark from "@/app/common/dashboard/Watermark";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    const handleSaveRequest = () => {
      void saveProfile();
    };

    window.addEventListener("dashboard:save-edit-profile", handleSaveRequest as EventListener);

    return () => {
      window.removeEventListener("dashboard:save-edit-profile", handleSaveRequest as EventListener);
    };
  }, [userProfile, profileData, links, socialLinks]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let profile = await getUser(user.uid);
        if (!profile) {
          const defaultLinks = [
            {
              id: "1",
              title: "My Portfolio",
              description: "Check out my latest work",
              url: "https://example.com",
              thumbnail: "/images/pages/website.svg",
              active: true,
              clicks: 0,
              ctr: 0,
              type: "custom",
            },
            {
              id: "2",
              title: "Personal Website",
              description: "Visit my home on the web",
              url: "https://example.com",
              thumbnail: "/images/pages/website.svg",
              active: true,
              clicks: 0,
              ctr: 0,
              type: "custom",
            },
            {
              id: "3",
              title: "Contact Me",
              description: "Reach out for collaborations",
              url: "mailto:hello@pasive.co",
              thumbnail: "/images/pages/website.svg",
              active: true,
              clicks: 0,
              ctr: 0,
              type: "custom",
            },
          ];
          const defaultSocialLinks = [
            {
              id: "1",
              platform: "Instagram",
              url: "https://instagram.com/username",
              thumbnail: "/images/pages/instagram.svg",
              active: true,
            },
            {
              id: "2",
              platform: "Twitter",
              url: "https://twitter.com/username",
              thumbnail: "/images/pages/twitter.svg",
              active: true,
            },
            {
              id: "3",
              platform: "YouTube",
              url: "",
              thumbnail: "/images/pages/youtube.svg",
              active: false,
            },
            {
              id: "4",
              platform: "LinkedIn",
              url: "https://linkedin.com/in/username",
              thumbnail: "/images/pages/linkedin.svg",
              active: true,
            },
            {
              id: "5",
              platform: "Facebook",
              url: "",
              thumbnail: "/images/pages/facebook.svg",
              active: false,
            },
            {
              id: "6",
              platform: "TikTok",
              url: "",
              thumbnail: "/images/pages/tik-tok.svg",
              active: false,
            },
            {
              id: "7",
              platform: "Spotify",
              url: "",
              thumbnail: "/images/pages/spotify.svg",
              active: false,
            },
            {
              id: "8",
              platform: "Discord",
              url: "",
              thumbnail: "/images/pages/discord.svg",
              active: false,
            },
          ];

          await updateUser(user.uid, {
            userId: user.uid,
            username: user.email?.split("@")[0] || "user",
            displayName: user.displayName || "Your Name",
            bio: "Building something amazing ✨",
            profilePicture: user.photoURL || "/images/dud.png",
            links: defaultLinks,
            socialLinks: defaultSocialLinks,
            isPublic: true,
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
            {
              id: "1",
              title: "My Portfolio",
              description: "Check out my latest work",
              url: "https://github.com",
              thumbnail: "/images/pages/website.svg",
              active: true,
              clicks: 0,
              ctr: 0,
              type: "custom",
            },
            {
              id: "2",
              title: "Personal Website",
              description: "Visit my home on the web",
              url: "https://example.com",
              thumbnail: "/images/pages/website.svg",
              active: true,
              clicks: 0,
              ctr: 0,
              type: "custom",
            },
          ];
          const defaultSocials = [
            {
              id: "1",
              platform: "Instagram",
              url: "https://instagram.com/username",
              thumbnail: "/images/pages/instagram.svg",
              active: true,
            },
            {
              id: "2",
              platform: "Twitter",
              url: "https://twitter.com/username",
              thumbnail: "/images/pages/twitter.svg",
              active: true,
            },
            {
              id: "3",
              platform: "LinkedIn",
              url: "https://linkedin.com/in/username",
              thumbnail: "/images/pages/linkedin.svg",
              active: true,
            },
            {
              id: "4",
              platform: "YouTube",
              url: "",
              thumbnail: "/images/pages/youtube.svg",
              active: false,
            },
            {
              id: "5",
              platform: "Facebook",
              url: "",
              thumbnail: "/images/pages/facebook.svg",
              active: false,
            },
            {
              id: "6",
              platform: "TikTok",
              url: "",
              thumbnail: "/images/pages/tik-tok.svg",
              active: false,
            },
            {
              id: "7",
              platform: "Spotify",
              url: "",
              thumbnail: "/images/pages/spotify.svg",
              active: false,
            },
            {
              id: "8",
              platform: "Discord",
              url: "",
              thumbnail: "/images/pages/discord.svg",
              active: false,
            },
          ];

          if (!profile.links || profile.links.length === 0) {
            setLinks(defaultLinks);
          } else {
            setLinks(profile.links);
          }

          const hasActiveSocials = profile.socialLinks?.some(
            (s) => s.active && s.url,
          );
          if (
            !profile.socialLinks ||
            profile.socialLinks.length === 0 ||
            !hasActiveSocials
          ) {
            setSocialLinks(defaultSocials);
          } else {
            setSocialLinks(profile.socialLinks);
          }

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

  const theme = {
    cardClass: "bg-background border-border",
    buttonClass:
      "border-border hover:border-muted-foreground hover:bg-muted/50 text-foreground",
    textClass: "text-foreground",
    iconClass: "text-muted-foreground",
  };


  const handleProfilePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileData((prev) => ({
        ...prev,
        profilePicture: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileData((prev) => ({
        ...prev,
        bannerImage: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: "New Link",
      description: "",
      url: "https://example.com",
      thumbnail: "/images/pages/website.svg",
      active: true,
      clicks: 0,
      ctr: 0,
      type: "custom",
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const handleEditLink = (link: any) => {
    setEditingLinkId(link.id);
    setEditTitle(link.title || "");
    setEditUrl(link.url || "");
  };

  const handleSaveLink = (linkId: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, title: editTitle, url: editUrl } : link,
      ),
    );
    setEditingLinkId(null);
    setEditTitle("");
    setEditUrl("");
  };

  const handleDeleteLink = (linkId: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
  };

  const handleToggleLink = (linkId: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === linkId ? { ...link, active: !link.active } : link,
      ),
    );
  };

  const handleSocialLinkChange = (
    socialId: string,
    updates: { url?: string; active?: boolean },
  ) => {
    setSocialLinks((prev) =>
      prev.map((social) =>
        social.id === socialId ? { ...social, ...updates } : social,
      ),
    );
  };

  const handleAddSocialPlatform = (socialId: string) => {
    setSocialLinks((prev) =>
      prev.map((social) =>
        social.id === socialId ? { ...social, active: true } : social,
      ),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <main className="flex-1 overflow-y-auto bg-muted/20 px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto flex w-full max-w-2xl justify-center">
          <div className="w-full rounded-2xl border border-border bg-card p-2 shadow-lg">
                <Card
                  className={`shadow-lg ${theme.cardClass} relative overflow-hidden border-none`}
                >
                  <div className="absolute top-0 left-0 right-0 z-20 bg-transparent pointer-events-none">
                    <div className="flex items-center justify-between p-3 pointer-events-auto">
                      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                        <DialogTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <Menu
                              className={`w-4 h-4 ${profileData.bannerImage ? "text-white drop-shadow-md" : "text-muted-foreground"}`}
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold mb-2">Profile Banner</label>
                              <div className="relative">
                                <div className="w-full h-24 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border">
                                  {profileData.bannerImage ? (
                                    <img src={profileData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Upload banner</span>
                                  )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-2">Profile Picture</label>
                              <div className="relative w-20 h-20">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden border border-border">
                                  {profileData.profilePicture ? (
                                    <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                  ) : (
                                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-2">Display Name</label>
                              <input
                                type="text"
                                value={profileData.displayName}
                                onChange={(e) => setProfileData((prev) => ({ ...prev, displayName: e.target.value }))}
                                className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-2">Bio</label>
                              <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                                rows={3}
                                className="w-full bg-muted/40 border border-border/50 rounded-lg px-3 py-2 text-sm resize-none"
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsShareModalOpen(true)}
                          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          aria-label="Share page"
                        >
                          <Share2
                            className={`w-4 h-4 ${profileData.bannerImage ? "text-white drop-shadow-md" : "text-muted-foreground"}`}
                          />
                        </button>
                        <button
                          onClick={() => window.open(profileUrl, "_blank")}
                          className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          aria-label="View public page"
                        >
                          <ExternalLink
                            className={`w-4 h-4 ${profileData.bannerImage ? "text-white drop-shadow-md" : "text-muted-foreground"}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {profileData.bannerImage && (
                    <div className="w-full h-32 relative z-10">
                      <img
                        src={profileData.bannerImage}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                    </div>
                  )}

                  <CardContent
                    className={`p-2 relative z-10 ${profileData.bannerImage ? "-mt-12" : "pt-14"}`}
                  >
                    <div className="text-center space-y-4 mb-6">
                      <div
                        className={`w-24 h-24 bg-muted rounded-full mx-auto overflow-hidden relative z-20 ${profileData.bannerImage ? "border-4 border-background shadow-sm" : ""}`}
                      >
                        {profileData.profilePicture ? (
                          <img
                            src={
                              profileData.profilePicture || "/placeholder.svg"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <UserIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2
                          className={`text-xl font-semibold ${theme.textClass}`}
                        >
                          @
                          {profileData.username?.startsWith("@")
                            ? profileData.username.substring(1)
                            : profileData.username}
                        </h2>
                        <p className={`${theme.iconClass} text-sm mt-2`}>
                          {profileData.bio}
                        </p>
                        <div className="flex justify-center gap-3 mt-4 flex-wrap items-center">
                          {socialLinks
                            .filter((link) => link.active)
                            .map((social) => (
                              <a
                                key={social.id}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-muted/50 transition-colors"
                              >
                                <img
                                  src={
                                    social.thumbnail ||
                                    "/images/pages/website.svg"
                                  }
                                  alt={social.platform}
                                  className="w-4 h-4 object-contain"
                                />
                              </a>
                            ))}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSocialModalOpen(true)}
                            className="w-8 h-8 rounded-full"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Dialog
                          open={isSocialModalOpen}
                          onOpenChange={setIsSocialModalOpen}
                        >
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Social links</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
                              {socialLinks.map((social) => (
                                <div key={social.id} className="border rounded-lg p-3 space-y-2">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <img src={social.thumbnail} alt={social.platform} className="w-4 h-4 object-contain" />
                                      <span className="text-sm font-medium">{social.platform}</span>
                                    </div>
                                    {social.active ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleSocialLinkChange(social.id, { active: false })}
                                      >
                                        <X className="w-4 h-4 mr-1" /> Remove
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddSocialPlatform(social.id)}
                                      >
                                        <Plus className="w-4 h-4 mr-1" /> Add
                                      </Button>
                                    )}
                                  </div>
                                  <input
                                    value={social.url || ""}
                                    onChange={(e) => handleSocialLinkChange(social.id, { url: e.target.value })}
                                    disabled={!social.active}
                                    placeholder={`${social.platform} URL`}
                                    className="w-full border rounded-md px-2 py-1.5 text-sm disabled:opacity-50"
                                  />
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="w-full mt-4 space-y-5">
                      <div className="space-y-3">
                        {links.map((link) => (
                          <div
                            key={link.id}
                            className={`w-full border h-auto p-4 rounded-lg text-base ${theme.buttonClass}`}
                          >
                            {editingLinkId === link.id ? (
                              <div className="space-y-2">
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full border rounded-md px-2 py-1 text-sm"
                                  placeholder="Link title"
                                />
                                <input
                                  value={editUrl}
                                  onChange={(e) => setEditUrl(e.target.value)}
                                  className="w-full border rounded-md px-2 py-1 text-sm"
                                  placeholder="https://example.com"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => setEditingLinkId(null)}>Cancel</Button>
                                  <Button size="sm" onClick={() => handleSaveLink(link.id)}><Check className="w-4 h-4 mr-1" />Save</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-start gap-3 min-w-0 flex-1"
                                >
                                  <img
                                    src={link.thumbnail}
                                    alt={link.title}
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = "/images/pages/website.svg";
                                    }}
                                  />
                                  <span className="font-medium truncate">{link.title}</span>
                                </a>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button size="icon" variant="ghost" onClick={() => handleToggleLink(link.id)}>
                                    <span className="text-[10px] font-semibold">{link.active ? "ON" : "OFF"}</span>
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleEditLink(link)}><Pencil className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteLink(link.id)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        <Button size="sm" onClick={handleAddLink} className="w-full">
                          <Plus className="w-4 h-4 mr-1" /> Add Link
                        </Button>
                      </div>

                      <div className="space-y-3 border-t pt-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Shop</p>
                        {loadingProducts ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          </div>
                        ) : activeProducts.length > 0 ? (
                          activeProducts.map((product) => (
                            <div key={product.id} className="space-y-2">
                              <a
                                href={`/${profileData.username}/product/${product.id}`}
                                className={`block border rounded-lg p-4 ${theme.buttonClass} transition-all`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                    {product.thumbnail ? (
                                      <img
                                        src={product.thumbnail}
                                        alt={product.name}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    ) : (
                                      <Package className={`w-6 h-6 ${theme.iconClass}`} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium text-sm ${theme.textClass}`}>{product.name}</h4>
                                    <p className={`text-xs ${theme.iconClass} mt-1 line-clamp-2`}>{product.description}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                      <span className={`font-bold text-sm ${theme.textClass}`}>
                                        {product.currency === "USD" ? "$" : product.currency}
                                        {product.price}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </a>
                              {product.url && (
                                <a href={product.url} target="_blank" rel="noopener noreferrer" className="block">
                                  <Button
                                    size="sm"
                                    className="w-full rounded-lg"
                                  >
                                    Buy Now
                                  </Button>
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground text-sm">No products available</div>
                        )}
                      </div>
                    </div>
                    <Watermark />
                  </CardContent>
                </Card>
                <ShareModal
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;

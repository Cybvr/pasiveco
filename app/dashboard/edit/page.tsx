"use client";

import { useState, useEffect } from "react";
import { User, ExternalLink, Package, Menu, Share2, Plus, Pencil, Check, Trash2 } from "lucide-react";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  type UserProfile,
} from "@/services/userProfilesService";
import { getUserProducts, type Product } from "@/services/productsService";
import { useAuth } from "@/hooks/useAuth";
import BioMode from "@/app/common/dashboard/BioMode";
import MiniPageModal from "@/app/common/dashboard/MiniPageModal";
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
import { cn } from "@/lib/utils";

function Page() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const [profileData, setProfileData] = useState<
    Partial<UserProfile> & {
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${profileData.username}`
      : `https://pasive.co/${profileData.username}`;


  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let profile = await getUserProfile(user.uid);
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

          await createUserProfile({
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
          profile = await getUserProfile(user.uid);
        }
        if (profile) {
          setUserProfile(profile);
          setProfileData((prev) => ({
            ...prev,
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio || "Building something amazing ✨",
            profilePicture: profile.profilePicture,
            bannerImage: profile.bannerImage || null,
            slug: profile.slug || profile.username,
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
      await updateUserProfile(userProfile.id!, {
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
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <nav className="flex items-center justify-between h-14 border-b px-4 shrink-0">
        <div className="flex items-center gap-1.5 h-full">
          <div
            className={cn(
              "flex items-center text-[13px] font-semibold rounded-lg transition-all duration-200 px-3 py-2",
              "bg-muted text-foreground",
            )}
          >
            <User className="h-4 w-4 mr-2 text-foreground" />
            <span>Edit Page</span>
          </div>
        </div>

        <div className="flex items-center gap-2 h-full">
          <button
            onClick={() => window.open(profileUrl, "_blank")}
            className="flex items-center text-[13px] font-semibold rounded-lg border border-border px-4 py-2 hover:bg-accent transition-all duration-200"
          >
            My Page
            <ExternalLink className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row md:h-[calc(100vh-3.5rem)] overflow-auto md:overflow-hidden min-h-0">
        <div className="w-full md:w-64 md:h-full overflow-visible md:overflow-hidden min-h-0 shrink-0">
          <BioMode
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            saveProfile={saveProfile}
          />
        </div>

        <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 bg-muted/20 overflow-auto min-h-[420px] md:min-h-0">
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm">Page Content</h3>
                <div className="flex items-center gap-2">
                  <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Profile Settings</Button>
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
                                <User className="w-5 h-5 text-muted-foreground" />
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
                  <Button size="sm" onClick={handleAddLink}>
                    <Plus className="w-4 h-4 mr-1" /> Add Link
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {links.map((link) => (
                  <div key={link.id} className="border rounded-lg p-3 bg-background">
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
                        <button onClick={() => handleToggleLink(link.id)} className={`text-xs px-2 py-1 rounded ${link.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                          {link.active ? "Visible" : "Hidden"}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{link.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEditLink(link)}><Pencil className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteLink(link.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="w-full max-w-sm h-[600px] md:h-full md:max-h-[650px] flex items-start justify-center min-h-0 mx-auto">
            <div className="w-full h-full overflow-auto bg-card rounded-xl border shadow-lg border-border">
              <div
                className="rounded-lg overflow-hidden p-2 min-h-[500px]"
              >
                <Card
                  className={`shadow-lg ${theme.cardClass} relative overflow-hidden border-none`}
                >
                  <div className="absolute top-0 left-0 right-0 z-20 bg-transparent pointer-events-none">
                    <div className="flex items-center justify-between p-3 pointer-events-auto">
                      <button
                        onClick={() => setIsPageModalOpen(true)}
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Menu
                          className={`w-4 h-4 ${profileData.bannerImage ? "text-white drop-shadow-md" : "text-muted-foreground"}`}
                        />
                      </button>
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Share2
                          className={`w-4 h-4 ${profileData.bannerImage ? "text-white drop-shadow-md" : "text-muted-foreground"}`}
                        />
                      </button>
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
                            <User className="w-8 h-8 text-muted-foreground" />
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
                        {socialLinks.filter((link) => link.active).length >
                          0 && (
                          <div className="flex justify-center gap-3 mt-4">
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
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="w-full mt-4 space-y-5">
                      <div className="space-y-3">
                        {links
                          .filter((link) => link.active)
                          .map((link) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-full flex items-center justify-start gap-3 border transition-colors cursor-pointer h-auto p-4 rounded-lg text-base ${theme.buttonClass}`}
                            >
                              <img
                                src={link.thumbnail}
                                alt={link.title}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "/images/pages/website.svg";
                                }}
                              />
                              <span className="font-medium">{link.title}</span>
                            </a>
                          ))}
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
                <MiniPageModal
                  isOpen={isPageModalOpen}
                  onClose={() => setIsPageModalOpen(false)}
                />
                <ShareModal
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Page;

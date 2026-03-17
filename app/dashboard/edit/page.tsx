"use client";

import { useState, useEffect } from "react";
import { User, ExternalLink, Package, Menu, Share2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Inter,
  Roboto,
  Poppins,
  Open_Sans,
  Lato,
  Montserrat,
  Nunito,
  Raleway,
  Ubuntu,
  Playfair_Display,
  Merriweather,
  Oswald,
  Source_Sans_3,
  Work_Sans,
  DM_Sans,
} from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });
const openSans = Open_Sans({ subsets: ["latin"] });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"] });
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const nunito = Nunito({ weight: ["400", "600", "700"], subsets: ["latin"] });
const raleway = Raleway({ weight: ["400", "500", "600"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["400", "500", "700"], subsets: ["latin"] });
const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});
const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
});
const oswald = Oswald({ weight: ["400", "500", "600"], subsets: ["latin"] });
const sourceSansPro = Source_Sans_3({
  weight: ["400", "600"],
  subsets: ["latin"],
});
const workSans = Work_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});
const dmSans = DM_Sans({ weight: ["400", "500", "700"], subsets: ["latin"] });

function Page() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
    backgroundType: "color",
    backgroundColor: "#ffffff",
    backgroundImage: null,
    pageBackgroundType: "color",
    pageBackgroundColor: "#ffffff",
    pageBackgroundImage: null,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${profileData.username}`
      : `https://pasive.co/${profileData.username}`;

  const [appearanceData, setAppearanceData] = useState({
    buttonShape: "rounded" as "rounded" | "square" | "pill",
    fontSize: "medium" as "small" | "medium" | "large",
    fontFamily: "sans-serif" as any,
    buttonSize: "medium" as "small" | "medium" | "large",
    buttonColor: "#ffffff",
    buttonTextColor: "#000000",
    textColor: "#000000",
  });

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
            theme: "default",
            isPublic: true,
            slug: user.email?.split("@")[0] || "user",
            appearance: appearanceData,
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
            backgroundType: profile.backgroundType || "color",
            backgroundColor: profile.backgroundColor || "#ffffff",
            backgroundImage: profile.backgroundImage || null,
            pageBackgroundType: profile.pageBackgroundType || "color",
            pageBackgroundColor: profile.pageBackgroundColor || "#ffffff",
            pageBackgroundImage: profile.pageBackgroundImage || null,
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

          setSelectedTheme(profile.theme || "default");
          if (profile.appearance) {
            setAppearanceData({
              buttonShape: profile.appearance.buttonShape || "rounded",
              fontSize: profile.appearance.fontSize || "medium",
              fontFamily: profile.appearance.fontFamily || "sans-serif",
              buttonSize: profile.appearance.buttonSize || "medium",
              buttonColor: profile.appearance.buttonColor || "#ffffff",
              buttonTextColor: profile.appearance.buttonTextColor || "#000000",
              textColor: profile.appearance.textColor || "#000000",
            });
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
        theme: selectedTheme,
        appearance: appearanceData,
        backgroundType: profileData.backgroundType,
        backgroundColor: profileData.backgroundColor,
        backgroundImage: profileData.backgroundImage,
        pageBackgroundType: profileData.pageBackgroundType,
        pageBackgroundColor: profileData.pageBackgroundColor,
        pageBackgroundImage: profileData.pageBackgroundImage,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const getAppearanceStyles = () => {
    const buttonShapeClass = {
      rounded: "rounded-lg",
      square: "rounded-none",
      pill: "rounded-full",
    }[appearanceData.buttonShape || "rounded"];

    const fontFamilyClass = {
      inter: inter.className,
      roboto: roboto.className,
      poppins: poppins.className,
      "open-sans": openSans.className,
      lato: lato.className,
      montserrat: montserrat.className,
      nunito: nunito.className,
      raleway: raleway.className,
      ubuntu: ubuntu.className,
      "playfair-display": playfairDisplay.className,
      merriweather: merriweather.className,
      oswald: oswald.className,
      "source-sans-pro": sourceSansPro.className,
      "work-sans": workSans.className,
      "dm-sans": dmSans.className,
    }[(appearanceData.fontFamily as any) || "inter"];

    const fontSizeClass = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    }[appearanceData.fontSize || "medium"];

    const buttonSizeClass = {
      small: "h-auto p-2",
      medium: "h-auto p-4",
      large: "h-auto p-6",
    }[appearanceData.buttonSize || "medium"];

    const tabSizeClass = {
      small: "py-1.5 px-3",
      medium: "py-2 px-4",
      large: "py-3 px-6",
    }[appearanceData.buttonSize || "medium"];

    return {
      buttonShapeClass,
      fontFamilyClass,
      fontSizeClass,
      buttonSizeClass,
      tabSizeClass,
      customButtonStyle: appearanceData.buttonColor
        ? {
            backgroundColor: appearanceData.buttonColor,
            borderColor: appearanceData.buttonColor,
          }
        : {},
      customTextStyle: appearanceData.textColor
        ? { color: appearanceData.textColor }
        : {},
      customButtonTextStyle: appearanceData.buttonTextColor
        ? { color: appearanceData.buttonTextColor }
        : {},
    };
  };

  const getThemeStyles = () => {
    switch (selectedTheme) {
      case "blue":
        return {
          cardClass: "bg-blue-50 border-blue-200",
          buttonClass:
            "border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700",
          textClass: "text-blue-800",
          iconClass: "text-blue-600",
          tabActiveClass: "bg-blue-100 text-blue-700 border-blue-300",
        };
      case "green":
        return {
          cardClass: "bg-green-50 border-green-200",
          buttonClass:
            "border-green-300 hover:border-green-400 hover:bg-green-50 text-green-700",
          textClass: "text-green-800",
          iconClass: "text-green-600",
          tabActiveClass: "bg-green-100 text-green-700 border-green-300",
        };
      case "purple":
        return {
          cardClass: "bg-purple-50 border-purple-200",
          buttonClass:
            "border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-purple-700",
          textClass: "text-purple-800",
          iconClass: "text-purple-600",
          tabActiveClass: "bg-purple-100 text-purple-700 border-purple-300",
        };
      default:
        return {
          cardClass: "bg-background border-border",
          buttonClass:
            "border-border hover:border-muted-foreground hover:bg-muted/50 text-foreground",
          textClass: "text-foreground",
          iconClass: "text-muted-foreground",
          tabActiveClass: "bg-muted text-foreground border-muted-foreground",
        };
    }
  };

  const getBackgroundStyle = () => {
    if (profileData.backgroundType === "image" && profileData.backgroundImage) {
      return {
        backgroundImage: `url(${profileData.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return profileData.backgroundColor
      ? { backgroundColor: profileData.backgroundColor }
      : {};
  };

  const getPageBackgroundStyle = () => {
    if (
      profileData.pageBackgroundType === "image" &&
      profileData.pageBackgroundImage
    ) {
      return {
        backgroundImage: `url(${profileData.pageBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return profileData.pageBackgroundColor
      ? { backgroundColor: profileData.pageBackgroundColor }
      : {};
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

  const theme = getThemeStyles();
  const appearance = getAppearanceStyles();
  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <nav className="flex items-center justify-between h-14 border-b px-4 shrink-0">
        <div className="flex items-center gap-1.5 h-full">
          <button
            className={cn(
              "flex items-center text-[13px] font-semibold rounded-lg transition-all duration-200 px-3 py-2",
              "bg-muted text-foreground",
            )}
          >
            <User className="h-4 w-4 mr-2 text-foreground" />
            <span>Link in Bio</span>
          </button>
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
            profileData={profileData as any}
            setProfileData={setProfileData as any}
            links={links}
            setLinks={setLinks}
            socialLinks={socialLinks}
            setSocialLinks={setSocialLinks}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            appearanceData={appearanceData as any}
            setAppearanceData={setAppearanceData as any}
            saveProfile={saveProfile}
          />
        </div>

        <div className="flex-1 p-4 md:p-6 flex items-center justify-center bg-muted/20 overflow-hidden min-h-[420px] md:min-h-0">
          <div className="w-full max-w-sm h-[600px] md:h-full md:max-h-[650px] flex items-start justify-center min-h-0">
            <div className="w-full h-full overflow-auto bg-card rounded-xl border shadow-lg border-border">
              <div
                className={`rounded-lg overflow-hidden p-2 min-h-[500px] ${appearance.fontFamilyClass}`}
                style={getPageBackgroundStyle()}
              >
                <Card
                  className={`shadow-lg ${theme.cardClass} relative overflow-hidden border-none`}
                  style={getBackgroundStyle()}
                >
                  {profileData.backgroundType === "image" &&
                    profileData.backgroundImage && (
                      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
                    )}
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

                    <Tabs defaultValue="links" className="w-full">
                      <TabsList
                        className={`grid grid-cols-2 p-1 rounded-lg items-center justify-center w-full gap-1 border-none ${appearance.buttonShapeClass}`}
                      >
                        <TabsTrigger
                          value="links"
                          className={`flex items-center gap-2 ${appearance.tabSizeClass} ${appearance.buttonShapeClass} ${appearance.fontSizeClass} ${theme.buttonClass}`}
                          style={{
                            ...appearance.customButtonStyle,
                            ...appearance.customButtonTextStyle,
                          }}
                        >
                          Links
                        </TabsTrigger>
                        <TabsTrigger
                          value="shop"
                          className={`flex items-center gap-2 ${appearance.tabSizeClass} ${appearance.buttonShapeClass} ${appearance.fontSizeClass} ${theme.buttonClass}`}
                          style={{
                            ...appearance.customButtonStyle,
                            ...appearance.customButtonTextStyle,
                          }}
                        >
                          Shop
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="links" className="mt-4">
                        <div className="space-y-3">
                          {links
                            .filter((link) => link.active)
                            .map((link) => (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full flex items-center justify-start gap-3 border transition-colors cursor-pointer ${appearance.buttonSizeClass} ${appearance.buttonShapeClass} ${appearance.fontSizeClass} ${theme.buttonClass}`}
                                style={{
                                  ...appearance.customButtonStyle,
                                  ...appearance.customButtonTextStyle,
                                }}
                              >
                                <img
                                  src={link.thumbnail}
                                  alt={link.title}
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/images/pages/website.svg";
                                  }}
                                />
                                <span className="font-medium">
                                  {link.title}
                                </span>
                              </a>
                            ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="shop" className="mt-4">
                        <div className="space-y-3">
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
                                        <Package
                                          className={`w-6 h-6 ${theme.iconClass}`}
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4
                                        className={`font-medium text-sm ${theme.textClass}`}
                                      >
                                        {product.name}
                                      </h4>
                                      <p
                                        className={`text-xs ${theme.iconClass} mt-1 line-clamp-2`}
                                      >
                                        {product.description}
                                      </p>
                                      <div className="flex items-center justify-between mt-2">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {product.category}
                                        </Badge>
                                        <span
                                          className={`font-bold text-sm ${theme.textClass}`}
                                        >
                                          {product.currency === "USD"
                                            ? "$"
                                            : product.currency}
                                          {product.price}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </a>
                                {product.url && (
                                  <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <Button
                                      size="sm"
                                      className={`w-full ${appearance.buttonShapeClass}`}
                                      style={{
                                        ...appearance.customButtonStyle,
                                        ...appearance.customButtonTextStyle,
                                      }}
                                    >
                                      Buy Now
                                    </Button>
                                  </a>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                              No products available
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
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

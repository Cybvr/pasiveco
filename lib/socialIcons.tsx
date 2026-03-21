import {
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn,
  FaFacebookF,
  FaTiktok,
  FaSpotify,
  FaDiscord,
  FaGlobe,
  FaGithub,
  FaSnapchatGhost,
  FaPinterest,
  FaTwitch,
  FaWhatsapp,
  FaTelegram,
  FaRedditAlien,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { IconType } from 'react-icons'

const platformIconMap: Record<string, IconType> = {
  instagram: FaInstagram,
  twitter: FaXTwitter,
  x: FaXTwitter,
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  spotify: FaSpotify,
  discord: FaDiscord,
  github: FaGithub,
  snapchat: FaSnapchatGhost,
  pinterest: FaPinterest,
  twitch: FaTwitch,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  reddit: FaRedditAlien,
}

export function getSocialIcon(platform: string): IconType {
  const key = platform?.toLowerCase().trim()
  return platformIconMap[key] || FaGlobe
}

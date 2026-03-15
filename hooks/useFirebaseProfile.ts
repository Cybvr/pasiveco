
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile, 
  UserProfile 
} from '@/services/userService'

export const useFirebaseProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        let userProfile = await getUserProfile(user.uid)
        
        if (!userProfile) {
          // Create new profile if doesn't exist
          const profileId = await createUserProfile({
            userId: user.uid,
            username: user.email?.split('@')[0] || 'user',
            displayName: user.displayName || 'Your Name',
            bio: 'Your bio here',
            profilePicture: user.photoURL || '/images/dud.png',
            links: [],
            socialLinks: [],
            theme: 'default',
            isPublic: true
          })
          
          userProfile = await getUserProfile(user.uid)
        }
        
        setProfile(userProfile)
        setError(null)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !user) return

    try {
      await updateUserProfile(profile.id!, updates)
      setProfile({ ...profile, ...updates })
      setError(null)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: () => {
      if (user) {
        getUserProfile(user.uid).then(setProfile)
      }
    }
  }
}

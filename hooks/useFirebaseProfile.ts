
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUser, updateUser, type User } from '@/services/userService'

export const useFirebaseProfile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
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
        let userProfile = await getUser(user.uid)

        if (!userProfile) {
          await updateUser(user.uid, {
            username: user.email?.split('@')[0] || 'user',
            displayName: user.displayName || 'Your Name',
            bio: 'Your bio here',
            profilePicture: user.photoURL || '/images/dud.png',
            links: [],
            socialLinks: [],
            theme: 'default',
            isPublic: true,
          })
          userProfile = await getUser(user.uid)
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

    void loadProfile()
  }, [user])

  const updateProfile = async (updates: Partial<User>) => {
    if (!profile || !user) return

    try {
      await updateUser(profile.id || user.uid, updates)
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
        getUser(user.uid).then(setProfile)
      }
    }
  }
}
